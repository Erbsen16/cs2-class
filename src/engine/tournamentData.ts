import data from './tournamentData.json';

export const LAST_UPDATED: string = data.lastUpdated;

export interface RealTeam {
  id: string; name: string; shortName: string; region: string; rank: number; color: string;
}

export interface RealMatch {
  id: string; teamA: string; teamB: string; winner: string | null; score?: string;
  stage: string; round?: string; matchType: string; played: boolean; date?: string;
}

export interface RealTournament {
  id: string; name: string; fullName: string; icon: string; color: string;
  organizer: string; dates: string; location: string; prize: string; format: string;
  stages: { name: string; desc: string; type: string;
    groups?: { name: string; matches: RealMatch[] }[];
    matches?: RealMatch[]; playoffMatches?: RealMatch[]; }[];
}

export const tournaments: Record<string, { info: RealTournament; teams: RealTeam[] }> = data.tournaments;
