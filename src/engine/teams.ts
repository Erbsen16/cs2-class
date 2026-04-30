import type { Team } from './types';

// 24 teams A-X for demo, V is the champion (yellow)
const colors: [string, string][] = [
  ['#f0a500', '#ffc940'], // V - yellow champion
  ['#007AFF', '#47a1ff'], // A
  ['#5856D6', '#7b79e8'], // B
  ['#FF3B30', '#ff6b5a'], // C
  ['#34C759', '#5ddb7a'], // D
  ['#FF9500', '#ffb340'], // E
  ['#AF52DE', '#c97df0'], // F
  ['#5AC8FA', '#7dd6fb'], // G
  ['#FF2D55', '#ff5e7b'], // H
  ['#8E8E93', '#a8a8ad'], // I
  ['#30B0C7', '#52c8db'], // J
  ['#32ADE6', '#5cc0ee'], // K
  ['#FF375F', '#ff6583'], // L
  ['#00C7BE', '#33d6cf'], // M
  ['#FFD60A', '#ffe040'], // N
  ['#0A84FF', '#409cff'], // O
  ['#BF5AF2', '#d07df7'], // P
  ['#64D2FF', '#8adeff'], // Q
  ['#30D158', '#5add7b'], // R
  ['#FF9F0A', '#ffb840'], // S
  ['#798188', '#959da3'], // T
  ['#AC8E68', '#c2a880'], // U
  ['#FF453A', '#ff6b5a'], // W
  ['#63E6E2', '#85eeea'], // X
];

// V is index 0 (seed 1), others follow alphabetically
const letters = 'VABCDEFGHIJKLMNOPQRSTUWX'.split('');

export const teams: Team[] = letters.map((letter, i) => ({
  id: letter.toLowerCase(),
  name: `Team ${letter}`,
  shortName: letter,
  region: i < 8 ? 'EU' : i < 16 ? 'NA' : 'ASIA',
  seed: i + 1,
  color: colors[i][0],
  secondaryColor: colors[i][1],
}));

export function getTeam(id: string): Team {
  return teams.find(t => t.id === id)!;
}

export function getTeams(ids: string[]): Team[] {
  return ids.map(id => getTeam(id)).filter(Boolean);
}
