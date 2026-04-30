// Real CS2 teams based on VRS/HLTV rankings (April 2026)
export interface RealTeam {
  id: string;
  name: string;
  shortName: string;
  region: string;
  rank: number;
}

export const realTeams: RealTeam[] = [
  // Top 10
  { id: 'vitality', name: 'Vitality', shortName: 'VIT', region: 'EU', rank: 1 },
  { id: 'navi', name: 'Natus Vincere', shortName: 'NAVI', region: 'EU', rank: 2 },
  { id: 'parivision', name: 'PARIVISION', shortName: 'PARI', region: 'EU', rank: 3 },
  { id: 'furia', name: 'FURIA', shortName: 'FUR', region: 'AM', rank: 4 },
  { id: 'aurora', name: 'Aurora', shortName: 'AUR', region: 'EU', rank: 5 },
  { id: 'falcons', name: 'Falcons', shortName: 'FLC', region: 'EU', rank: 6 },
  { id: 'mouz', name: 'MOUZ', shortName: 'MOUZ', region: 'EU', rank: 7 },
  { id: 'mongolz', name: 'The MongolZ', shortName: 'MGLZ', region: 'AS', rank: 8 },
  { id: 'spirit', name: 'Spirit', shortName: 'TS', region: 'EU', rank: 9 },
  { id: 'astralis', name: 'Astralis', shortName: 'AST', region: 'EU', rank: 10 },

  // 11-20
  { id: 'g2', name: 'G2', shortName: 'G2', region: 'EU', rank: 11 },
  { id: 'fut', name: 'FUT Esports', shortName: 'FUT', region: 'EU', rank: 12 },
  { id: '9z', name: '9z Team', shortName: '9Z', region: 'AM', rank: 13 },
  { id: 'pain', name: 'paiN Gaming', shortName: 'PAIN', region: 'AM', rank: 14 },
  { id: 'monte', name: 'Monte', shortName: 'MNTE', region: 'EU', rank: 15 },
  { id: 'legacy', name: 'Legacy', shortName: 'LGC', region: 'AM', rank: 16 },
  { id: 'gamerlegion', name: 'GamerLegion', shortName: 'GL', region: 'EU', rank: 17 },
  { id: 'big', name: 'BIG', shortName: 'BIG', region: 'EU', rank: 18 },
  { id: 'betboom', name: 'BetBoom', shortName: 'BB', region: 'EU', rank: 19 },
  { id: 'b8', name: 'B8', shortName: 'B8', region: 'EU', rank: 20 },

  // 21-30
  { id: 'heroic', name: 'HEROIC', shortName: 'HRC', region: 'EU', rank: 21 },
  { id: 'sinners', name: 'SINNERS', shortName: 'SIN', region: 'EU', rank: 22 },
  { id: 'alliance', name: 'Alliance', shortName: 'ALL', region: 'EU', rank: 23 },
  { id: '3dmax', name: '3DMAX', shortName: '3DM', region: 'EU', rank: 24 },
  { id: 'm80', name: 'M80', shortName: 'M80', region: 'AM', rank: 25 },
  { id: 'tyloo', name: 'TYLOO', shortName: 'TYL', region: 'AS', rank: 26 },
  { id: 'liquid', name: 'Team Liquid', shortName: 'TL', region: 'AM', rank: 27 },
  { id: 'nip', name: 'Ninjas in Pyjamas', shortName: 'NIP', region: 'EU', rank: 28 },
  { id: 'nrg', name: 'NRG', shortName: 'NRG', region: 'AM', rank: 29 },
  { id: 'ence', name: 'ENCE', shortName: 'ENCE', region: 'EU', rank: 30 },

  // 31-45
  { id: 'virtuspro', name: 'Virtus.pro', shortName: 'VP', region: 'EU', rank: 31 },
  { id: 'saw', name: 'SAW', shortName: 'SAW', region: 'EU', rank: 32 },
  { id: 'og', name: 'OG', shortName: 'OG', region: 'EU', rank: 33 },
  { id: 'eternalfire', name: 'Eternal Fire', shortName: 'EF', region: 'EU', rank: 34 },
  { id: 'complexity', name: 'Complexity', shortName: 'COL', region: 'AM', rank: 35 },
  { id: 'imperial', name: 'Imperial', shortName: 'IMP', region: 'AM', rank: 36 },
  { id: 'c9', name: 'Cloud9', shortName: 'C9', region: 'AM', rank: 37 },
  { id: 'metizport', name: 'Metizport', shortName: 'MTZ', region: 'EU', rank: 38 },
  { id: 'lynnvision', name: 'Lynn Vision', shortName: 'LV', region: 'AS', rank: 39 },
  { id: 'forze', name: 'forZe', shortName: 'FZ', region: 'EU', rank: 40 },
  { id: 'apeks', name: 'Apeks', shortName: 'APK', region: 'EU', rank: 41 },
  { id: 'ecstatic', name: 'ECSTATIC', shortName: 'ECS', region: 'EU', rank: 42 },
  { id: 'sangal', name: 'Sangal', shortName: 'SNG', region: 'EU', rank: 43 },
  { id: 'amkal', name: 'AMKAL', shortName: 'AMK', region: 'EU', rank: 44 },
  { id: 'fnatic', name: 'Fnatic', shortName: 'FNC', region: 'EU', rank: 45 },

  // 46-60
  { id: 'nemiga', name: 'Nemiga', shortName: 'NMG', region: 'EU', rank: 46 },
  { id: 'k23', name: 'K23', shortName: 'K23', region: 'EU', rank: 47 },
  { id: 'endpoint', name: 'Endpoint', shortName: 'END', region: 'EU', rank: 48 },
  { id: 'mibr', name: 'MIBR', shortName: 'MIBR', region: 'AM', rank: 49 },
  { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', region: 'AM', rank: 50 },
  { id: 'redcanids', name: 'RED Canids', shortName: 'RED', region: 'AM', rank: 51 },
  { id: 'fluxo', name: 'Fluxo', shortName: 'FLX', region: 'AM', rank: 52 },
  { id: 'atox', name: 'ATOX', shortName: 'ATX', region: 'AS', rank: 53 },
  { id: 'rareatom', name: 'Rare Atom', shortName: 'RA', region: 'AS', rank: 54 },
  { id: 'drift', name: 'Drift', shortName: 'DRF', region: 'AS', rank: 55 },
  { id: 'alterego', name: 'Alter Ego', shortName: 'AE', region: 'AS', rank: 56 },
  { id: 'talon', name: 'Talon', shortName: 'TLN', region: 'AS', rank: 57 },
  { id: 'rooster', name: 'Rooster', shortName: 'RST', region: 'OCE', rank: 58 },
  { id: 'flyquest', name: 'FlyQuest', shortName: 'FQ', region: 'OCE', rank: 59 },
  { id: 'badnews', name: 'Bad News Kangaroos', shortName: 'BNK', region: 'OCE', rank: 60 },

  // 61-75
  { id: 'insilio', name: 'Insilio', shortName: 'INS', region: 'EU', rank: 61 },
  { id: 'passionua', name: 'Passion UA', shortName: 'PUA', region: 'EU', rank: 62 },
  { id: 'permitta', name: 'Permitta', shortName: 'PER', region: 'EU', rank: 63 },
  { id: 'rebel', name: 'Rebels', shortName: 'REB', region: 'EU', rank: 64 },
  { id: 'zerotenacity', name: 'Zero Tenacity', shortName: 'Z10', region: 'EU', rank: 65 },
  { id: 'talisman', name: 'Talisman', shortName: 'TAL', region: 'EU', rank: 66 },
  { id: 'dynamoeclot', name: 'Dynamo Eclot', shortName: 'DEC', region: 'EU', rank: 67 },
  { id: 'entropiq', name: 'Entropiq', shortName: 'ENT', region: 'EU', rank: 68 },
  { id: 'eyeballers', name: 'Eyeballers', shortName: 'EYE', region: 'EU', rank: 69 },
  { id: 'guild', name: 'Guild Eagles', shortName: 'GDE', region: 'EU', rank: 70 },
  { id: 'hype', name: 'Hype', shortName: 'HYP', region: 'AM', rank: 71 },
  { id: 'case', name: 'Case', shortName: 'CASE', region: 'AM', rank: 72 },
  { id: 'w7m', name: 'W7M', shortName: 'W7M', region: 'AM', rank: 73 },
  { id: 'sharks', name: 'Sharks', shortName: 'SHK', region: 'AM', rank: 74 },
  { id: 'selva', name: 'Selva', shortName: 'SLV', region: 'AM', rank: 75 },

  // 76-90
  { id: 'jiuye', name: 'JiJieHao', shortName: 'JJH', region: 'AS', rank: 76 },
  { id: 'newhappy', name: 'NewHappy', shortName: 'NH', region: 'AS', rank: 77 },
  { id: 'steelhelmet', name: 'Steel Helmet', shortName: 'SH', region: 'AS', rank: 78 },
  { id: 'mindfreak', name: 'Mindfreak', shortName: 'MF', region: 'OCE', rank: 79 },
  { id: 'vertex', name: 'Vertex', shortName: 'VTX', region: 'OCE', rank: 80 },
  { id: 'arcanum', name: 'Arcanum', shortName: 'ARC', region: 'OCE', rank: 81 },
  { id: 'elevate', name: 'Elevate', shortName: 'ELV', region: 'AM', rank: 82 },
  { id: 'wildcard', name: 'Wildcard', shortName: 'WLD', region: 'AM', rank: 83 },
  { id: 'timbermen', name: 'Timbermen', shortName: 'TMB', region: 'AM', rank: 84 },
  { id: 'partyastro', name: 'Party Astronauts', shortName: 'PA', region: 'AM', rank: 85 },
  { id: 'gaimin', name: 'Gaimin Gladiators', shortName: 'GG', region: 'EU', rank: 86 },
  { id: 'sashi', name: 'Sashi', shortName: 'SSH', region: 'EU', rank: 87 },
  { id: 'tsm', name: 'TSM', shortName: 'TSM', region: 'EU', rank: 88 },
  { id: 'bleed', name: 'Bleed', shortName: 'BLD', region: 'EU', rank: 89 },
  { id: 'looking4org', name: 'Looking4Org', shortName: 'L4O', region: 'EU', rank: 90 },

  // 91-100
  { id: '9pandas', name: '9 Pandas', shortName: '9P', region: 'EU', rank: 91 },
  { id: 'aurorayb', name: 'Aurora Young Blood', shortName: 'AYB', region: 'EU', rank: 92 },
  { id: 'spiritac', name: 'Spirit Academy', shortName: 'TSA', region: 'EU', rank: 93 },
  { id: 'navijunior', name: 'NAVI Junior', shortName: 'NAVJ', region: 'EU', rank: 94 },
  { id: 'mouzac', name: 'MOUZ NXT', shortName: 'MZN', region: 'EU', rank: 95 },
  { id: 'faze', name: 'FaZe Clan', shortName: 'FAZE', region: 'EU', rank: 96 },
  { id: 'koi', name: 'KOI', shortName: 'KOI', region: 'EU', rank: 97 },
  { id: 'movistar', name: 'Movistar Riders', shortName: 'MVR', region: 'EU', rank: 98 },
  { id: 'itb', name: 'Into The Breach', shortName: 'ITB', region: 'EU', rank: 99 },
  { id: 'gods', name: 'GODSENT', shortName: 'GOD', region: 'EU', rank: 100 },
];

export const tournaments = [
  { id: 'major', name: 'Major', fullName: 'IEM 科隆 Major 2026', icon: '🏆', color: '#f0a500' },
  { id: 'iem', name: 'IEM', fullName: 'IEM 里约/卡托维兹/科隆', icon: '🔷', color: '#007AFF' },
  { id: 'blast', name: 'BLAST', fullName: 'BLAST Open / Rivals', icon: '⚡', color: '#5856D6' },
  { id: 'pgl', name: 'PGL', fullName: 'PGL 克卢日/布加勒斯特', icon: '🎯', color: '#FF3B30' },
];
