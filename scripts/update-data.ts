/**
 * Fetch real CS2 tournament data from HLTV and update tournamentData.json
 * Run: npx tsx scripts/update-data.ts
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { HLTV } = require('hltv');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT = path.join(__dirname, '..', 'src', 'engine', 'tournamentData.json');

// Retry with exponential backoff — HLTV is behind Cloudflare and often fails in CI
async function retry<T>(fn: () => Promise<T>, label: string, maxRetries = 3): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries) throw e;
      const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
      console.warn(`  ⚠ ${label} failed (attempt ${i + 1}/${maxRetries + 1}), retrying in ${(delay / 1000).toFixed(1)}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

// Polite delay between API calls to avoid rate limits
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Tournament configs we care about (HLTV event names)
const TRACKED_TOURNAMENTS = [
  { id: 'blast', name: 'BLAST Rivals 2026 Season 1', color: '#5856D6', icon: '⚡' },
  { id: 'cac', name: 'CAC 2026', color: '#e53935', icon: '🌏' },
  { id: 'major', name: 'IEM Cologne Major 2026', color: '#f0a500', icon: '🏆' },
  { id: 'iem', name: 'IEM Atlanta 2026', color: '#007AFF', icon: '🔷' },
];

interface SimpleTeam {
  id: string;
  name: string;
  shortName: string;
  region: string;
  rank: number;
  color: string;
}

interface SimpleMatch {
  id: string;
  teamA: string;
  teamB: string;
  winner: string | null;
  score: string | null;
  stage: string;
  matchType: string;
  played: boolean;
  date: string | null;
  round: string;
}

const REGION_COLORS: Record<string, string> = {
  EU: '#3b82f6', NA: '#ef4444', SA: '#22c55e',
  ASIA: '#f59e0b', OCE: '#8b5cf6', INT: '#6b7280',
};

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}

async function fetchTeamRanking(): Promise<Map<string, { rank: number; region: string }>> {
  try {
    const rankings: any = await retry(() => HLTV.getTeamRanking(), 'Rankings fetch');
    const map = new Map<string, { rank: number; region: string }>();
    rankings.forEach((t: any, i: number) => {
      map.set(t.team.name.toLowerCase(), { rank: i + 1, region: t.team.region || 'EU' });
    });
    console.log(`  Fetched ${map.size} team rankings`);
    return map;
  } catch (e) {
    console.error('  Failed to fetch rankings after retries:', (e as Error).message);
    return new Map();
  }
}

async function main() {
  console.log('Fetching CS2 tournament data from HLTV...\n');

  // Load existing data as fallback for tournaments not found on HLTV
  let existing: Record<string, any> = {};
  try {
    const raw = fs.readFileSync(OUTPUT, 'utf-8');
    const parsed = JSON.parse(raw);
    existing = parsed.tournaments || {};
    console.log(`  Loaded ${Object.keys(existing).length} existing tournaments as fallback\n`);
  } catch (e) {
    console.log('  No existing data to merge\n');
  }

  // Get team rankings
  const rankings = await fetchTeamRanking();

  // Get all events
  let events: any[] = [];
  try {
    events = await retry(() => HLTV.getEvents(), 'Events fetch') || [];
    console.log(`  Fetched ${events.length} upcoming/ongoing events`);
  } catch (e) {
    console.error('  Failed to fetch events after retries:', (e as Error).message);
  }

  const tournamentData: Record<string, { info: any; teams: SimpleTeam[] }> = {};

  for (const cfg of TRACKED_TOURNAMENTS) {
    console.log(`\nProcessing: ${cfg.name}...`);

    // Find matching event — prefer the main event, skip stage/qualifier sub-events
    const candidates = events.filter((e: any) =>
      e.name?.toLowerCase().includes(cfg.name.toLowerCase()) ||
      cfg.name.toLowerCase().includes(e.name?.toLowerCase())
    );
    const event = candidates.find((e: any) => !/(?:stage|qualif|closed|open)\s*\d/i.test(e.name)) || candidates[0];

    if (!event) {
      console.log(`  Not found on HLTV — using existing data`);
      if (existing[cfg.id]) {
        tournamentData[cfg.id] = existing[cfg.id];
      }
      continue;
    }

    console.log(`  Found event: ${event.name} (ID: ${event.id})`);

    // Get event details with matches
    let eventDetail: any = null;
    try {
      eventDetail = await retry(() => HLTV.getEvent({ id: event.id }), `Event detail for ${cfg.name}`);
    } catch (e) {
      console.error(`  Failed to get event detail for ${cfg.name}:`, (e as Error).message);
    }

    // Small delay between tournaments to avoid rate limits
    await sleep(1500);

    // Extract teams
    const teams: SimpleTeam[] = (eventDetail?.teams || event.teams || []).map((t: any) => {
      const name = t.name || t.team?.name || '';
      const rankInfo = rankings.get(name.toLowerCase());
      return {
        id: slug(name),
        name,
        shortName: name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, ''),
        region: rankInfo?.region || t.region || 'EU',
        rank: rankInfo?.rank || t.rank || 99,
        color: REGION_COLORS[rankInfo?.region || 'EU'] || '#6b7280',
      };
    });

    // Extract matches
    const matches: SimpleMatch[] = (eventDetail?.matches || []).map((m: any, i: number) => ({
      id: `${cfg.id}-m${i + 1}`,
      teamA: slug(m.team1?.name || m.leftTeam?.name || ''),
      teamB: slug(m.team2?.name || m.rightTeam?.name || ''),
      winner: m.winner ? slug(m.winner?.name || '') : null,
      score: m.result || m.score || null,
      stage: m.stage || 'group',
      matchType: m.format || 'BO3',
      played: !!m.result,
      date: m.date || null,
      round: m.title || '',
    }));

    // If HLTV has no match data but we have existing data with matches, keep existing
    const existingHasMatches = existing[cfg.id]?.info?.stages?.some((s: any) => {
      if (s.groups) for (const g of s.groups) if (g.matches?.length) return true;
      if (s.playoffMatches?.length) return true;
      return false;
    });

    if (matches.length === 0 && existingHasMatches) {
      console.log(`  No matches from HLTV — keeping existing stages but updating teams`);
      tournamentData[cfg.id] = {
        info: { ...existing[cfg.id].info, organizer: event.organizer || existing[cfg.id].info.organizer, dates: event.dateRange || existing[cfg.id].info.dates },
        teams,
      };
    } else {
      // Build stages from match data
      const groupMatches = matches.filter(m => m.stage === 'group' || m.stage.includes('group'));
      const playoffMatches = matches.filter(m => m.stage === 'playoff' || m.stage.includes('playoff'));

      const stages: any[] = [];
      if (groupMatches.length > 0) {
        const half = Math.ceil(groupMatches.length / 2);
        stages.push({
          name: '小组赛',
          desc: `${teams.length} 支队伍参赛`,
          type: 'gsl',
          groups: [
            { name: 'A 组', matches: groupMatches.slice(0, half) },
            ...(half < groupMatches.length ? [{ name: 'B 组', matches: groupMatches.slice(half) }] : []),
          ],
        });
      }
      if (playoffMatches.length > 0) {
        stages.push({
          name: '季后赛',
          desc: '单败淘汰',
          type: 'playoff8',
          playoffMatches,
        });
      }

      if (stages.length === 0) {
        stages.push({
          name: eventDetail?.prize ? '进行中' : '待公布',
          desc: eventDetail?.prize || '参赛队伍待公布',
          type: 'gsl',
          groups: [],
        });
      }

      tournamentData[cfg.id] = {
        info: {
          id: cfg.id,
          name: cfg.id === 'major' ? 'Major' : cfg.id === 'cac' ? 'CAC 2026' : event.name || cfg.name,
          fullName: event.name || cfg.name,
          icon: cfg.icon,
          color: cfg.color,
          organizer: event.organizer || '',
          dates: event.dateRange || '',
          location: typeof event.location === 'string' ? event.location : event.location?.name || '',
          prize: event.prize || '',
          format: event.format || '',
          stages,
        },
        teams,
      };
    }
  }

  // Write output
  const output = {
    lastUpdated: new Date().toISOString(),
    tournaments: tournamentData,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ Written to ${OUTPUT}`);
  console.log(`  Tournaments: ${Object.keys(tournamentData).join(', ')}`);
}

main().catch(console.error);
