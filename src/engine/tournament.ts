import type { Tournament } from './types';
import { teams } from './teams';
import { generateSwissStage } from './swiss';
import { generateGSLDemo } from './gsl';
import { generatePlayoffs8, generatePlayoffs6 } from './playoffs';
import type { PlayoffMatch } from './types';

const sorted = [...teams].sort((a, b) => a.seed - b.seed);

/** Swiss → 8-team single elim (Major format) */
export function generateSwissPlayoffs(): { matches: PlayoffMatch[]; name: string } {
  const stage1Teams = sorted.slice(8, 24);
  const swiss1 = generateSwissStage(stage1Teams, 'swiss1', 42, true);

  const stage2Teams = [
    ...swiss1.advanced.map(id => sorted.find(t => t.id === id)!),
    ...sorted.slice(0, 8),
  ];
  const swiss2 = generateSwissStage(stage2Teams, 'swiss2', 137, true);

  const stage2Eliminated = swiss2.records
    .filter(r => swiss2.eliminated.includes(r.teamId) && !swiss2.advanced.includes(r.teamId))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .slice(0, 8)
    .map(r => sorted.find(t => t.id === r.teamId)!);

  const stage3Teams = [
    ...swiss2.advanced.map(id => sorted.find(t => t.id === id)!),
    ...stage2Eliminated,
  ];
  const swiss3 = generateSwissStage(stage3Teams, 'swiss3', 256, false);

  return {
    matches: generatePlayoffs8(swiss3.advanced, 512),
    name: '瑞士轮 → 单败淘汰（8 队）',
  };
}

/** GSL → 6-team single elim (IEM/BLAST format) */
export function generateGSLPlayoffs(): {
  matches: PlayoffMatch[];
  name: string;
  groupWinners: { teamId: string; group: string }[];
} {
  const groupTeams = sorted.slice(0, 8).map(t => t.id);
  const groups = generateGSLDemo(groupTeams, 42);

  // Group A: advanced[0]=A1, advanced[1]=A2, advanced[2]=A3
  // Group B: advanced[0]=B1, advanced[1]=B2, advanced[2]=B3
  const groupWinners = [
    { teamId: groups[0].advanced[0], group: 'A' },
    { teamId: groups[1].advanced[0], group: 'B' },
  ];

  return {
    matches: generatePlayoffs6(groups[0].advanced, groups[1].advanced, 512),
    name: 'GSL 双败 → 单败淘汰（6 队）',
    groupWinners,
  };
}

/** Full tournament (for Swiss page display) */
export function generateTournament(): Tournament {
  const stage1Teams = sorted.slice(8, 24);
  const swiss1 = generateSwissStage(stage1Teams, 'swiss1', 42, true);

  const stage2Teams = [
    ...swiss1.advanced.map(id => sorted.find(t => t.id === id)!),
    ...sorted.slice(0, 8),
  ];
  const swiss2 = generateSwissStage(stage2Teams, 'swiss2', 137, true);

  const stage2Eliminated = swiss2.records
    .filter(r => swiss2.eliminated.includes(r.teamId) && !swiss2.advanced.includes(r.teamId))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .slice(0, 8)
    .map(r => sorted.find(t => t.id === r.teamId)!);

  const stage3Teams = [
    ...swiss2.advanced.map(id => sorted.find(t => t.id === id)!),
    ...stage2Eliminated,
  ];
  const swiss3 = generateSwissStage(stage3Teams, 'swiss3', 256, false);

  const playoffs = generatePlayoffs8(swiss3.advanced, 512);

  return {
    id: 'major-2026-demo',
    name: 'CS2 Major 演示赛',
    teams: sorted,
    swiss1,
    swiss2,
    swiss3,
    playoffs,
    currentStage: 'swiss1',
  };
}
