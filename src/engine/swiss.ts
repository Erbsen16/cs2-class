import type { Team, Match, SwissRecord, SwissStage } from './types';

// Simple seeded RNG
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function simulateMatch(teamA: Team, teamB: Team, rand: () => number, bo1: boolean): string {
  // V always wins
  if (teamA.id === 'v') return teamA.id;
  if (teamB.id === 'v') return teamB.id;
  // Higher seed (lower number) = stronger team, but with variance
  const seedDiff = teamB.seed - teamA.seed;
  const baseChance = 0.5 + (seedDiff / 50);
  const variance = (rand() - 0.5) * 0.6;
  const extraVariance = bo1 ? (rand() - 0.5) * 0.3 : 0;
  const winChance = Math.max(0.05, Math.min(0.95, baseChance + variance + extraVariance));
  return rand() < winChance ? teamA.id : teamB.id;
}

function calcBuchholz(record: SwissRecord, allRecords: SwissRecord[]): number {
  // Sum of opponents' wins
  return 0; // Simplified for demo
}

export function generateSwissStage(
  teams: Team[],
  stageId: 'swiss1' | 'swiss2' | 'swiss3',
  seed: number,
  bo1: boolean = true
): SwissStage {
  const rand = seededRandom(seed);
  const records: SwissRecord[] = teams.map(t => ({
    teamId: t.id,
    wins: 0,
    losses: 0,
    buchholz: 0,
    roundDiff: 0,
  }));

  const matches: Match[] = [];
  const advanced: string[] = [];
  const eliminated: string[] = [];
  let matchCounter = 0;

  // Standard first-round Swiss: split into 4 quarters, Q1 vs reversed Q4, reversed Q2 vs Q3
  function makeInitialPairs(n: number): [number, number][] {
    const q = Math.floor(n / 4);
    const pairs: [number, number][] = [];
    for (let i = 0; i < q; i++) pairs.push([i, n - 1 - i]);
    for (let i = 0; i < q; i++) pairs.push([2 * q - 1 - i, 2 * q + i]);
    return pairs;
  }

  const initialPairs = makeInitialPairs(teams.length);

  for (let round = 1; round <= 5; round++) {
    const active = records.filter(r => r.wins < 3 && r.losses < 3);

    if (active.length === 0) break;

    let pairs: [SwissRecord, SwissRecord][];

    if (round === 1) {
      pairs = initialPairs
        .filter(([a, b]) => a < active.length && b < active.length)
        .map(([a, b]) => [active[a], active[b]]);
    } else {
      // Group by record, pair within groups
      const groups = new Map<string, SwissRecord[]>();
      for (const r of active) {
        const key = `${r.wins}-${r.losses}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      }

      pairs = [];
      for (const [, group] of groups) {
        // Shuffle then pair
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
        for (let i = 0; i < group.length - 1; i += 2) {
          pairs.push([group[i], group[i + 1]]);
        }
        // If odd number, move one team to next record group (handled by carry-over)
      }
    }

    for (const [recA, recB] of pairs) {
      const teamA = teams.find(t => t.id === recA.teamId)!;
      const teamB = teams.find(t => t.id === recB.teamId)!;
      const isBo1 = bo1 && round < 3; // BO1 for early rounds, BO3 for elim/adv

      matchCounter++;
      const winner = simulateMatch(teamA, teamB, rand, isBo1);

      const match: Match = {
        id: `${stageId}-r${round}-m${matchCounter}`,
        teamA: teamA.id,
        teamB: teamB.id,
        winner,
        stage: stageId,
        round,
        matchType: isBo1 ? 'bo1' : 'bo3',
      };
      matches.push(match);

      // Update records
      if (winner === teamA.id) {
        recA.wins++;
        recB.losses++;
      } else {
        recB.wins++;
        recA.losses++;
      }
    }

    // Check for teams that reached 3 wins or 3 losses
    for (const r of records) {
      if (r.wins >= 3 && !advanced.includes(r.teamId)) {
        advanced.push(r.teamId);
      }
      if (r.losses >= 3 && !eliminated.includes(r.teamId)) {
        eliminated.push(r.teamId);
      }
    }
  }

  return {
    records,
    matches,
    eliminated,
    advanced,
    currentRound: 5,
    completed: true,
  };
}
