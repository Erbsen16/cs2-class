import { realTeams, type RealTeam } from './realTeams';

// ── Types ──

export interface PickemMatch {
  id: string;
  teamA: RealTeam;
  teamB: RealTeam;
  winner: string | null; // team id — null until user submits
  userPick: string | null;
  correct: boolean | null;
}

export interface PickemStage {
  id: string;
  name: string;
  description: string;
  matches: PickemMatch[];
  requiredCorrect: number; // how many correct picks to "pass" this stage
  submitted: boolean;
  coinLabel: string; // e.g. "铜币", "银币"
}

export interface PickemTournament {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  stages: PickemStage[];
  currentStage: number;
  coinLevel: number; // 0=none, 1=bronze, 2=silver, 3=gold, 4=diamond
}

// ── Seeded RNG ──

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickWinner(a: RealTeam, b: RealTeam, rng: () => number): string {
  // Lower rank = stronger
  const diff = b.rank - a.rank;
  const chance = 0.5 + diff / 100 + (rng() - 0.5) * 0.5;
  return rng() < Math.max(0.1, Math.min(0.9, chance)) ? a.id : b.id;
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Generator: Major (Swiss ×3 → 8-team single elim) ──

export function generateMajorPickem(): PickemTournament {
  const rng = seededRandom(777);
  const pool = shuffled(realTeams.slice(0, 32), rng);

  const stages: PickemStage[] = [];

  // Stage 1: Swiss (16 teams, predict first round only)
  const s1Teams = pool.slice(0, 16);
  const s1Matches = generateSwissRound1(s1Teams, rng);
  stages.push({
    id: 'major-s1', name: '第一阶段 · 揭幕战', description: '16 队瑞士轮首轮。预测 8 场比赛的胜者。',
    matches: s1Matches, requiredCorrect: 5, submitted: false, coinLabel: '铜币',
  });

  // Stage 2: Swiss (simulate rest of s1, get 8 advancers + 8 seeds 1-8)
  const s1Advancers = s1Matches.map(m => m.winner!);
  const s2Teams = [...s1Advancers.map(id => realTeams.find(t => t.id === id)!), ...pool.slice(16, 24)];
  const s2Matches = generateSwissRound1(s2Teams, rng);
  stages.push({
    id: 'major-s2', name: '第二阶段 · 淘汰赛阶段', description: '8 支晋级队 + 8 支种子队，16 队瑞士轮首轮。',
    matches: s2Matches, requiredCorrect: 5, submitted: false, coinLabel: '银币',
  });

  // Stage 3: Swiss (another 16-team)
  const s2Advancers = s2Matches.map(m => m.winner!);
  const s3Teams = [...s2Advancers.map(id => realTeams.find(t => t.id === id)!), ...pool.slice(24, 32)];
  const s3Matches = generateSwissRound1(s3Teams, rng);
  stages.push({
    id: 'major-s3', name: '第三阶段 · 传奇组', description: '最终 16 队瑞士轮首轮。赢家进入季后赛。',
    matches: s3Matches, requiredCorrect: 5, submitted: false, coinLabel: '金币',
  });

  // Stage 4: Playoffs (8-team single elim — pick champion)
  const s3Advancers = s3Matches.map(m => m.winner!);
  const playoffTeams = s3Advancers.slice(0, 8).map(id => realTeams.find(t => t.id === id)!);
  const playoffMatches = generatePlayoffBracket(playoffTeams, rng);
  stages.push({
    id: 'major-p4', name: '季后赛 · 单败淘汰', description: '8 队单败淘汰。预测每场胜者，猜对冠军得钻石币。',
    matches: playoffMatches, requiredCorrect: 7, submitted: false, coinLabel: '钻石币',
  });

  return {
    id: 'major', name: 'Major', fullName: 'Major 科隆 2026', icon: '🏆', color: '#f0a500',
    stages, currentStage: 0, coinLevel: 0,
  };
}

// ── Generator: IEM (GSL ×2 → 6-team single elim) ──

export function generateIEMPickem(): PickemTournament {
  const rng = seededRandom(888);
  const pool = shuffled(realTeams.slice(0, 12), rng);

  const stages: PickemStage[] = [];

  // Stage 1: GSL Groups (predict group winners)
  const groupA = pool.slice(0, 4);
  const groupB = pool.slice(4, 8);
  const gslMatches = [
    ...generateGSLMatches(groupA, 'A', rng),
    ...generateGSLMatches(groupB, 'B', rng),
  ];
  stages.push({
    id: 'iem-s1', name: '小组赛 · GSL 双败', description: '两组各 4 队。预测小组赛全部 8 场比赛的胜者。',
    matches: gslMatches, requiredCorrect: 5, submitted: false, coinLabel: '银币',
  });

  // Stage 2: Playoffs (6-team → pick champion)
  // GSL has 4 matches per group: M1(1v4), M2(2v3), M3(losers), M4(upper final)
  // advanced: [M4W (#1), M4L (#2), M3W (#3)]
  const allAdv = [
    realTeams.find(t => t.id === gslMatches[3]?.winner)!,
    realTeams.find(t => t.id === (gslMatches[3]?.winner === gslMatches[3]?.teamA.id ? gslMatches[3]?.teamB.id : gslMatches[3]?.teamA.id))!,
    realTeams.find(t => t.id === gslMatches[2]?.winner)!,
    realTeams.find(t => t.id === gslMatches[7]?.winner)!,
    realTeams.find(t => t.id === (gslMatches[7]?.winner === gslMatches[7]?.teamA.id ? gslMatches[7]?.teamB.id : gslMatches[7]?.teamA.id))!,
    realTeams.find(t => t.id === gslMatches[6]?.winner)!,
  ];
  const playoffs6 = generatePlayoff6Bracket(allAdv, rng);
  stages.push({
    id: 'iem-s2', name: '季后赛 · 6 队单败淘汰', description: '两组各 3 队出线，前 2 轮空。预测最终冠军。',
    matches: playoffs6, requiredCorrect: 4, submitted: false, coinLabel: '金币',
  });

  return {
    id: 'iem', name: 'IEM', fullName: 'IEM 里约 2026', icon: '🔷', color: '#007AFF',
    stages, currentStage: 0, coinLevel: 0,
  };
}

// ── Generator: BLAST ──

export function generateBLASTPickem(): PickemTournament {
  const rng = seededRandom(999);
  const pool = shuffled(realTeams.slice(0, 12), rng);

  const stages: PickemStage[] = [];

  const groupA = pool.slice(0, 4);
  const groupB = pool.slice(4, 8);
  const gslMatches = [
    ...generateGSLMatches(groupA, 'A', rng),
    ...generateGSLMatches(groupB, 'B', rng),
  ];
  stages.push({
    id: 'blast-s1', name: '小组赛 · GSL 双败', description: '两组各 4 队。预测小组赛 8 场比赛的胜者。',
    matches: gslMatches, requiredCorrect: 5, submitted: false, coinLabel: '银币',
  });

  const allAdv = [
    realTeams.find(t => t.id === gslMatches[3]?.winner)!,
    realTeams.find(t => t.id === (gslMatches[3]?.winner === gslMatches[3]?.teamA.id ? gslMatches[3]?.teamB.id : gslMatches[3]?.teamA.id))!,
    realTeams.find(t => t.id === gslMatches[2]?.winner)!,
    realTeams.find(t => t.id === gslMatches[7]?.winner)!,
    realTeams.find(t => t.id === (gslMatches[7]?.winner === gslMatches[7]?.teamA.id ? gslMatches[7]?.teamB.id : gslMatches[7]?.teamA.id))!,
    realTeams.find(t => t.id === gslMatches[6]?.winner)!,
  ];
  const playoffs6 = generatePlayoff6Bracket(allAdv, rng);
  stages.push({
    id: 'blast-s2', name: '季后赛 · 6 队单败淘汰', description: '预测最终冠军，赢取最高硬币。',
    matches: playoffs6, requiredCorrect: 4, submitted: false, coinLabel: '金币',
  });

  return {
    id: 'blast', name: 'BLAST', fullName: 'BLAST Open 2026', icon: '⚡', color: '#5856D6',
    stages, currentStage: 0, coinLevel: 0,
  };
}

// ── Generator: PGL (Swiss → 8-team single elim) ──

export function generatePGLPickem(): PickemTournament {
  const rng = seededRandom(1111);
  const pool = shuffled(realTeams.slice(0, 24), rng);

  const stages: PickemStage[] = [];

  const s1Teams = pool.slice(0, 16);
  const s1Matches = generateSwissRound1(s1Teams, rng);
  stages.push({
    id: 'pgl-s1', name: '小组赛 · 瑞士轮', description: '16 队瑞士轮首轮。预测 8 场比赛的胜者。',
    matches: s1Matches, requiredCorrect: 5, submitted: false, coinLabel: '铜币',
  });

  const advancers = s1Matches.map(m => m.winner!);
  const playoffTeams = advancers.slice(0, 8).map(id => realTeams.find(t => t.id === id)!);
  const playoffMatches = generatePlayoffBracket(playoffTeams, rng);
  stages.push({
    id: 'pgl-s2', name: '季后赛 · 8 队单败淘汰', description: '预测每场胜者及最终冠军。',
    matches: playoffMatches, requiredCorrect: 6, submitted: false, coinLabel: '金币',
  });

  return {
    id: 'pgl', name: 'PGL', fullName: 'PGL 布加勒斯特 2026', icon: '🎯', color: '#FF3B30',
    stages, currentStage: 0, coinLevel: 0,
  };
}

// ── Match generators ──

function generateSwissRound1(teams: RealTeam[], rng: () => number): PickemMatch[] {
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);
  const n = sorted.length;
  const q = Math.floor(n / 4);
  const pairs: [number, number][] = [];
  for (let i = 0; i < q; i++) pairs.push([i, n - 1 - i]);
  for (let i = 0; i < q; i++) pairs.push([2 * q - 1 - i, 2 * q + i]);

  return pairs.map(([a, b], i) => {
    const winner = pickWinner(sorted[a], sorted[b], rng);
    return { id: `swiss-r1-${i}`, teamA: sorted[a], teamB: sorted[b], winner, userPick: null, correct: null };
  });
}

function generatePlayoffBracket(teams: RealTeam[], rng: () => number): PickemMatch[] {
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);
  const qf = [[0, 7], [3, 4], [1, 6], [2, 5]];
  const matches: PickemMatch[] = [];

  // QF
  const qfWinners: string[] = [];
  for (let i = 0; i < 4; i++) {
    const [a, b] = qf[i];
    const w = pickWinner(sorted[a], sorted[b], rng);
    qfWinners.push(w);
    matches.push({ id: `qf-${i}`, teamA: sorted[a], teamB: sorted[b], winner: w, userPick: null, correct: null });
  }

  // SF
  const sfWinners: string[] = [];
  for (let i = 0; i < 2; i++) {
    const a = realTeams.find(t => t.id === qfWinners[i * 2])!;
    const b = realTeams.find(t => t.id === qfWinners[i * 2 + 1])!;
    const w = pickWinner(a, b, rng);
    sfWinners.push(w);
    matches.push({ id: `sf-${i}`, teamA: a, teamB: b, winner: w, userPick: null, correct: null });
  }

  // Final
  const fa = realTeams.find(t => t.id === sfWinners[0])!;
  const fb = realTeams.find(t => t.id === sfWinners[1])!;
  const fw = pickWinner(fa, fb, rng);
  matches.push({ id: 'final', teamA: fa, teamB: fb, winner: fw, userPick: null, correct: null });

  return matches;
}

function generateGSLMatches(teams: RealTeam[], group: string, rng: () => number): PickemMatch[] {
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);
  const matches: PickemMatch[] = [];

  // M1: 1v4
  const m1W = pickWinner(sorted[0], sorted[3], rng);
  const m1L = m1W === sorted[0].id ? sorted[3] : sorted[0];
  matches.push({ id: `gsl-${group}-m1`, teamA: sorted[0], teamB: sorted[3], winner: m1W, userPick: null, correct: null });

  // M2: 2v3
  const m2W = pickWinner(sorted[1], sorted[2], rng);
  const m2L = m2W === sorted[1].id ? sorted[2] : sorted[1];
  matches.push({ id: `gsl-${group}-m2`, teamA: sorted[1], teamB: sorted[2], winner: m2W, userPick: null, correct: null });

  // M3: losers
  const m3W = pickWinner(m1L, m2L, rng);
  matches.push({ id: `gsl-${group}-m3`, teamA: m1L, teamB: m2L, winner: m3W, userPick: null, correct: null });

  // M4: upper final
  const m4W = pickWinner(realTeams.find(t => t.id === m1W)!, realTeams.find(t => t.id === m2W)!, rng);
  matches.push({ id: `gsl-${group}-m4`, teamA: realTeams.find(t => t.id === m1W)!, teamB: realTeams.find(t => t.id === m2W)!, winner: m4W, userPick: null, correct: null });

  return matches;
}

function generatePlayoff6Bracket(teams: RealTeam[], rng: () => number): PickemMatch[] {
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);
  const matches: PickemMatch[] = [];

  // Byes: top 2 seeds
  // QF: 3v6, 4v5
  const qf1W = pickWinner(sorted[2], sorted[5], rng);
  matches.push({ id: 'qf-1', teamA: sorted[2], teamB: sorted[5], winner: qf1W, userPick: null, correct: null });

  const qf2W = pickWinner(sorted[3], sorted[4], rng);
  matches.push({ id: 'qf-2', teamA: sorted[3], teamB: sorted[4], winner: qf2W, userPick: null, correct: null });

  // SF: 1st vs QF2W, 2nd vs QF1W
  const sf1W = pickWinner(sorted[0], realTeams.find(t => t.id === qf2W)!, rng);
  matches.push({ id: 'sf-1', teamA: sorted[0], teamB: realTeams.find(t => t.id === qf2W)!, winner: sf1W, userPick: null, correct: null });

  const sf2W = pickWinner(sorted[1], realTeams.find(t => t.id === qf1W)!, rng);
  matches.push({ id: 'sf-2', teamA: sorted[1], teamB: realTeams.find(t => t.id === qf1W)!, winner: sf2W, userPick: null, correct: null });

  // Final
  const fw = pickWinner(realTeams.find(t => t.id === sf1W)!, realTeams.find(t => t.id === sf2W)!, rng);
  matches.push({ id: 'final', teamA: realTeams.find(t => t.id === sf1W)!, teamB: realTeams.find(t => t.id === sf2W)!, winner: fw, userPick: null, correct: null });

  return matches;
}
