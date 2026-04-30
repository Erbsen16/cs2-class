import type { Team, PlayoffMatch } from './types';
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
  const variance = (rand() - 0.5) * 0.4;
  return rand() < Math.max(0.05, Math.min(0.95, baseChance + variance)) ? a.id : b.id;
}

/** 8-team bracket: Swiss → QF(4 matches) → SF(2) → Final(1) */
export function generatePlayoffs8(teams: string[], seed: number): PlayoffMatch[] {
  const rand = seededRandom(seed);
  const teamObjects = teams.map(id => getTeam(id)).sort((a, b) => a.seed - b.seed);
  const matches: PlayoffMatch[] = [];

  // QF: 1v8, 4v5, 2v7, 3v6
  const qfPairs = [[0, 7], [3, 4], [1, 6], [2, 5]];
  const qfWinners: string[] = [];
  for (let i = 0; i < 4; i++) {
    const [a, b] = qfPairs[i];
    const winner = simWinner(teamObjects[a], teamObjects[b], rand);
    qfWinners.push(winner);
    matches.push({
      id: `qf-${i + 1}`, round: 'qf',
      matchA: teamObjects[a].id, matchB: teamObjects[b].id,
      winner, nextMatchId: `sf-${Math.floor(i / 2) + 1}`,
    });
  }

  // SF: QF1 winner vs QF2 winner, QF3 winner vs QF4 winner
  for (let i = 0; i < 2; i++) {
    const winner = simWinner(getTeam(qfWinners[i * 2]), getTeam(qfWinners[i * 2 + 1]), rand);
    matches.push({
      id: `sf-${i + 1}`, round: 'sf',
      matchA: qfWinners[i * 2], matchB: qfWinners[i * 2 + 1],
      winner, nextMatchId: 'final',
    });
  }

  const sf1 = matches[matches.length - 2];
  const sf2 = matches[matches.length - 1];
  matches.push({
    id: 'final', round: 'final',
    matchA: sf1.winner!, matchB: sf2.winner!,
    winner: 'v', nextMatchId: null,
  });

  return matches;
}

/** 6-team bracket: GSL → 2 group winners get bye + QF(2 matches) → SF(2) → Final(1)
 *  byeTeams[0] = A组第1, byeTeams[1] = B组第1
 *  QF1: A2 vs B3, QF2: B2 vs A3  (cross-group)
 *  SF1: A组第1 vs QF2 winner, SF2: B组第1 vs QF1 winner */
export function generatePlayoffs6(
  group1Teams: string[], // [A1, A2, A3]
  group2Teams: string[], // [B1, B2, B3]
  seed: number
): PlayoffMatch[] {
  const rand = seededRandom(seed);
  const matches: PlayoffMatch[] = [];

  const a1 = group1Teams[0]; // A组第1 → bye
  const a2 = group1Teams[1];
  const a3 = group1Teams[2];
  const b1 = group2Teams[0]; // B组第1 → bye
  const b2 = group2Teams[1];
  const b3 = group2Teams[2];

  // QF1: A2 vs B3 (cross), winner faces B1
  const qf1Winner = simWinner(getTeam(a2), getTeam(b3), rand);
  matches.push({
    id: 'qf-1', round: 'qf',
    matchA: a2, matchB: b3,
    winner: qf1Winner, nextMatchId: 'sf-2',
  });

  // QF2: B2 vs A3 (cross), winner faces A1
  const qf2Winner = simWinner(getTeam(b2), getTeam(a3), rand);
  matches.push({
    id: 'qf-2', round: 'qf',
    matchA: b2, matchB: a3,
    winner: qf2Winner, nextMatchId: 'sf-1',
  });

  // SF1: A1 (bye) vs QF2 winner (B2/A3 winner)
  const sf1Winner = simWinner(getTeam(a1), getTeam(qf2Winner), rand);
  matches.push({
    id: 'sf-1', round: 'sf',
    matchA: a1, matchB: qf2Winner,
    winner: sf1Winner, nextMatchId: 'final',
  });

  // SF2: B1 (bye) vs QF1 winner (A2/B3 winner)
  const sf2Winner = simWinner(getTeam(b1), getTeam(qf1Winner), rand);
  matches.push({
    id: 'sf-2', round: 'sf',
    matchA: b1, matchB: qf1Winner,
    winner: sf2Winner, nextMatchId: 'final',
  });

  matches.push({
    id: 'final', round: 'final',
    matchA: sf1Winner, matchB: sf2Winner,
    winner: 'v', nextMatchId: null,
  });

  return matches;
}

export function simulatePlayoffMatch(match: PlayoffMatch, seed: number, forceWinner?: string): string {
  if (forceWinner) return forceWinner;
  const rand = seededRandom(seed);
  return simWinner(getTeam(match.matchA), getTeam(match.matchB), rand);
}
