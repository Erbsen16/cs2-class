export interface Team {
  id: string;
  name: string;
  shortName: string;
  region: 'EU' | 'NA' | 'SA' | 'ASIA' | 'OCE';
  seed: number;
  color: string;       // primary brand color
  secondaryColor: string;
}

export interface Match {
  id: string;
  teamA: string;         // team id
  teamB: string;         // team id
  winner: string | null; // team id or null if not played
  stage: 'swiss1' | 'swiss2' | 'swiss3' | 'playoffs';
  round: number;         // Swiss: 1-5, Playoffs: 1-4 (qf/sf/final)
  matchType: 'bo1' | 'bo3' | 'bo5';
  groupName?: string;    // for GSL: 'A' | 'B'
  bracket?: 'upper' | 'lower'; // for GSL
}

export interface SwissRecord {
  teamId: string;
  wins: number;
  losses: number;
  buchholz: number;     // tiebreaker
  roundDiff: number;
}

export interface SwissStage {
  records: SwissRecord[];
  matches: Match[];
  eliminated: string[];  // team ids
  advanced: string[];    // team ids
  currentRound: number;
  completed: boolean;
}

export interface PlayoffMatch {
  id: string;
  round: 'qf' | 'sf' | 'final';
  matchA: string; // teamA id
  matchB: string;
  winner: string | null;
  nextMatchId: string | null;
}

export interface GSLGroup {
  name: string;
  teams: string[];  // 4 team ids
  matches: Match[];
  advanced: string[]; // 3 team ids (both upper winners + lower winner)
  completed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  swiss1: SwissStage;
  swiss2: SwissStage;
  swiss3: SwissStage;
  playoffs: PlayoffMatch[];
  currentStage: 'swiss1' | 'swiss2' | 'swiss3' | 'playoffs' | 'finished';
}
