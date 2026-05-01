/**
 * Fetch real CS2 tournament data from HLTV and update tournamentData.json
 * Run: npx tsx scripts/update-data.ts
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { HLTV } = require('hltv');
const { fetchPage, generateRandomSuffix } = require('hltv/lib/utils');
const { defaultConfig } = require('hltv/lib/config');
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

/**
 * Scrape match results from HLTV event page HTML.
 * getEvent() doesn't return matches, but the event page has bracket data
 * embedded in JSON format with team names, scores, and match IDs.
 */
async function scrapeEventMatches(eventId: number, _eventName: string): Promise<SimpleMatch[]> {
  try {
    // Use event overview page with random suffix (same pattern as HLTV package)
    const url = `https://www.hltv.org/events/${eventId}/${generateRandomSuffix()}`;
    const page = await retry(() => fetchPage(url, defaultConfig.loadPage), `Event page ${eventId}`);
    const raw = page.html();
    // Decode HTML entities
    const html = raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&');

    // Extract match URLs and scores, then pair them
    // Pattern: FixedTeam with team name, followed by or near a matchScore
    // HLTV page structure: slotId -> matchup -> { match, result, team1, team2 }

    // Find all matchup blocks
    const matchupRe = /"slotId":\{"id":"([^"]+)"\},"matchup":\{(.*?)(?="slotId"|$)/g;
    const matchups: { slot: string; data: string }[] = [];
    let mm;
    while ((mm = matchupRe.exec(html)) !== null) {
      matchups.push({ slot: mm[1], data: mm[2] });
    }

    // If regex above doesn't work well, use a brace-counting approach
    if (matchups.length === 0) {
      // Alternative: extract all match URLs and match them with scores
      const matchUrlRe = /"matchPageURL":"\/matches\/(\d+)\/([^"]+)"/g;
      const matchScoreRe = /"team1Score":(\d+),"team2Score":(\d+),"team1Winner":(true|false)/g;

      const matchEntries: { id: number; url: string; idx: number }[] = [];
      let mu;
      while ((mu = matchUrlRe.exec(html)) !== null) {
        matchEntries.push({ id: parseInt(mu[1]), url: mu[2], idx: mu.index });
      }

      const scores: { team1Score: number; team2Score: number; team1Winner: boolean; idx: number }[] = [];
      let ms;
      while ((ms = matchScoreRe.exec(html)) !== null) {
        scores.push({
          team1Score: parseInt(ms[1]),
          team2Score: parseInt(ms[2]),
          team1Winner: ms[3] === 'true',
          idx: ms.index,
        });
      }

      // Match scores to match entries by proximity in HTML
      const results: SimpleMatch[] = [];
      const seenMatchIds = new Set<number>();

      for (const entry of matchEntries) {
        // Find the closest score to this match entry
        let bestScore: typeof scores[0] | null = null;
        let bestDist = Infinity;
        for (const score of scores) {
          const dist = Math.abs(score.idx - entry.idx);
          if (dist < bestDist && dist < 20000) {
            bestDist = dist;
            bestScore = score;
          }
        }

        // Parse team names from URL slug: "vitality-vs-g2-blast-rivals-..."
        const parts = entry.url.split('-');
        const vsIdx = parts.findIndex(p => p === 'vs');
        if (vsIdx === -1) continue;

        const teamASlug = parts.slice(0, vsIdx).join('-');
        const after = parts.slice(vsIdx + 1);
        // Stop at tournament name markers
        const endIdx = after.findIndex(p =>
          ['blast', 'iem', 'cac', 'major', 'cologne', 'atlanta', 'rivals', 'season'].includes(p.toLowerCase())
        );
        const teamBSlug = (endIdx === -1 ? after : after.slice(0, endIdx)).join('-');

        const teamA = teamASlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const teamB = teamBSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        if (!teamA || !teamB) continue;

        let winner: string | null = null;
        let score: string | null = null;

        if (bestScore) {
          score = `${bestScore.team1Score}-${bestScore.team2Score}`;
          winner = bestScore.team1Winner ? teamA : teamB;
        }

        if (!seenMatchIds.has(entry.id)) {
          seenMatchIds.add(entry.id);
          results.push({
            id: `m${entry.id}`,
            teamA: slug(teamA),
            teamB: slug(teamB),
            winner: winner ? slug(winner) : null,
            score,
            stage: 'group',
            matchType: 'BO3',
            played: !!score,
            date: null,
            round: '',
          });
        }
      }

      // Sort: by played status, then by id
      return results.sort((a, b) => {
        if (a.played !== b.played) return a.played ? -1 : 1;
        return a.id.localeCompare(b.id);
      });
    }

    return [];
  } catch (e) {
    console.warn(`  ⚠ Failed to scrape matches from event page:`, (e as Error).message);
    return [];
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

    // Scrape matches from event page (getEvent doesn't return matches)
    console.log(`  Scraping match results...`);
    const matches = await retry(() => scrapeEventMatches(event.id, event.name), `Match scrape for ${cfg.name}`);

    if (matches.length === 0) {
      // Check if existing data has matches to preserve
      const existingHasMatches = existing[cfg.id]?.info?.stages?.some((s: any) => {
        if (s.groups) for (const g of s.groups) if (g.matches?.length) return true;
        if (s.playoffMatches?.length) return true;
        return false;
      });

      if (existingHasMatches) {
        console.log(`  No matches scraped — keeping existing stages but updating teams`);
        tournamentData[cfg.id] = {
          info: { ...existing[cfg.id].info, organizer: event.organizer || existing[cfg.id].info.organizer, dates: event.dateRange || existing[cfg.id].info.dates },
          teams,
        };
        continue;
      }
    }

    // Assign match stage/round from slot names
    const stagePrefixes: string[] = [];
    for (const m of matches) { stagePrefixes.push(m.id); }
    // Determine group vs playoff from match order/IDs
    // HLTV match IDs are sequential — early IDs = group stage
    const sortedMatches = [...matches].sort((a, b) => a.id.localeCompare(b.id));
    const groupMatchCount = Math.min(sortedMatches.length, 8); // up to 8 group matches
    sortedMatches.forEach((m, i) => {
      m.stage = i < groupMatchCount ? 'group' : 'playoff';
      m.id = `${cfg.id}-m${i + 1}`;
    });

    if (sortedMatches.length === 0 && existing[cfg.id]?.info?.stages) {
      // No matches found, keep existing
      tournamentData[cfg.id] = existing[cfg.id];
    } else {
      // Build stages
      // Split group matches into A/B groups
      const groupMatches = sortedMatches.filter(m => m.stage === 'group');
      const playoffMatches = sortedMatches.filter(m => m.stage === 'playoff');

      const half = Math.ceil(groupMatches.length / 2);
      const groupA = groupMatches.slice(0, half);
      const groupB = groupMatches.slice(half);

      const stages: any[] = [];
      if (groupA.length > 0) {
        stages.push({
          name: '小组赛',
          desc: `${teams.length} 支队伍参赛`,
          type: 'gsl',
          groups: [
            { name: 'A 组', matches: groupA },
            ...(groupB.length > 0 ? [{ name: 'B 组', matches: groupB }] : []),
          ],
        });
      }
      if (playoffMatches.length > 0) {
        stages.push({
          name: '季后赛',
          desc: '单败淘汰',
          type: playoffMatches.length > 4 ? 'playoff8' : 'playoff6',
          playoffMatches,
        });
      }
      if (stages.length === 0) {
        stages.push({
          name: '待公布',
          desc: '参赛队伍待公布',
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
