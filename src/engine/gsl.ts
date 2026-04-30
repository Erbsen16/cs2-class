import type { Team, Match, GSLGroup } from './types';
import { getTeam } from './teams';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function simWinner(a: Team, b: Team, rand: () => number): string {
  if (a.id === 'v') return a.id;
  if (b.id === 'v') return b.id;
  const seedDiff = b.seed - a.seed;
  const baseChance = 0.5 + (seedDiff / 50);
  const variance = (rand() - 0.5) * 0.5;
  return rand() < Math.max(0.05, Math.min(0.95, baseChance + variance)) ? a.id : b.id;
}

/**
 * CS2 GSL 4-match format (BLAST / IEM):
 *   M1: #1 vs #4
 *   M2: #2 vs #3
 *   M4: M1W vs M2W  → winner=#1, loser=#2  (BOTH advance)
 *   M3: M1L vs M2L  → winner=#3, loser=4th
 *   3 advance, 1 eliminated
 */
export function generateGSLGroup(
  teamIds: string[],
  groupName: string,
  seed: number
): GSLGroup {
  const rand = seededRandom(seed);
  const t = teamIds.map(id => getTeam(id));
  const matches: Match[] = [];
  let mid = 0;

  // M1: #1 vs #4
  mid++;
  const m1W = simWinner(t[0], t[3], rand);
  const m1L = m1W === t[0].id ? t[3].id : t[0].id;
  matches.push({
    id: `gsl-${groupName}-m${mid}`,
    teamA: t[0].id, teamB: t[3].id, winner: m1W,
    stage: 'swiss1', round: 1, matchType: 'bo3',
    groupName, bracket: 'upper',
  });

  // M2: #2 vs #3
  mid++;
  const m2W = simWinner(t[1], t[2], rand);
  const m2L = m2W === t[1].id ? t[2].id : t[1].id;
  matches.push({
    id: `gsl-${groupName}-m${mid}`,
    teamA: t[1].id, teamB: t[2].id, winner: m2W,
    stage: 'swiss1', round: 1, matchType: 'bo3',
    groupName, bracket: 'upper',
  });

  // M3: M1L vs M2L → winner=#3, loser=4th
  mid++;
  const m3W = simWinner(getTeam(m1L), getTeam(m2L), rand);
  const m3L = m3W === m1L ? m2L : m1L;
  matches.push({
    id: `gsl-${groupName}-m${mid}`,
    teamA: m1L, teamB: m2L, winner: m3W,
    stage: 'swiss1', round: 2, matchType: 'bo3',
    groupName, bracket: 'lower',
  });

  // M4: M1W vs M2W (upper final — winner=#1, loser=#2, both advance)
  mid++;
  const m4W = simWinner(getTeam(m1W), getTeam(m2W), rand);
  const m4L = m4W === m1W ? m2W : m1W;
  matches.push({
    id: `gsl-${groupName}-m${mid}`,
    teamA: m1W, teamB: m2W, winner: m4W,
    stage: 'swiss1', round: 2, matchType: 'bo3',
    groupName, bracket: 'upper',
  });

  return {
    name: groupName,
    teams: teamIds,
    matches,
    advanced: [m4W, m4L, m3W], // #1, #2, #3
    completed: true,
  };
}

export function generateGSLDemo(teamIds: string[], seed: number): GSLGroup[] {
  const groups: GSLGroup[] = [];
  for (let i = 0; i < teamIds.length; i += 4) {
    const groupTeams = teamIds.slice(i, i + 4);
    const groupName = String.fromCharCode(65 + i / 4);
    groups.push(generateGSLGroup(groupTeams, groupName, seed + i));
  }
  return groups;
}
