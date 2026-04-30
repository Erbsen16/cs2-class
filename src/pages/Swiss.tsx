import { useMemo } from 'react';
import { generateSwissStage } from '../engine/swiss';
import { teams, getTeam } from '../engine/teams';
import type { SwissStage, Match } from '../engine/types';
import RulePanel, { Tip, Badge } from '../components/RulePanel';

export default function Swiss() {
  const stage = useMemo(() => {
    const sixteen = [...teams].sort((a, b) => a.seed - b.seed).slice(0, 16);
    return generateSwissStage(sixteen, 'swiss1', 42, true);
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 80px' }} className="page-enter">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8, marginBottom: 8, color: '#1d1d1f' }}>
          瑞士轮
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 440, maxWidth: 600 }}>
          Swiss System — 16 队，同战绩互打。3 胜晋级，3 败淘汰，最多 5 轮。
        </p>
      </div>

      <SwissBracketView stage={stage} />

      <div style={{ marginTop: 56, maxWidth: 680, margin: '56px auto 0' }}>
        <RulePanel title="规则要点" icon="📖">
          <h4 style={{ color: '#1d1d1f', marginTop: 8, marginBottom: 4, fontSize: 14, fontWeight: 640 }}>基本规则</h4>
          <ul style={{ paddingLeft: 18, marginBottom: 8, fontSize: 14 }}>
            <li>赢 3 场 = <Badge variant="win">晋级</Badge> · 输 3 场 = <Badge variant="loss">淘汰</Badge></li>
            <li>同战绩的队伍互相对战（1-0 打 1-0，2-1 打 2-1）</li>
            <li>第 1 轮按种子排名配对，之后各轮同战绩随机抽签</li>
            <li>晋级/淘汰战用 BO3，其余用 BO1（变数更大）</li>
          </ul>
          <Tip>
            新手理解：瑞士轮就像"按分数分班考试"——考同样分数的人下次在同一个考场。虽然每轮对手不同，但永远是"同分对战"。
          </Tip>
        </RulePanel>
      </div>
    </div>
  );
}

function SwissBracketView({ stage }: { stage: SwissStage }) {
  const rounds = [1, 2, 3, 4, 5];

  const teamPreRecord = new Map<string, Map<number, string>>();
  for (const rec of stage.records) teamPreRecord.set(rec.teamId, new Map([[0, '0-0']]));
  const current = new Map<string, { w: number; l: number }>();
  for (const r of stage.records) current.set(r.teamId, { w: 0, l: 0 });

  for (let r = 1; r <= 5; r++) {
    const matches = stage.matches.filter(m => m.round === r);
    for (const m of matches) {
      if (m.winner === m.teamA) { current.get(m.teamA)!.w++; current.get(m.teamB)!.l++; }
      else if (m.winner === m.teamB) { current.get(m.teamB)!.w++; current.get(m.teamA)!.l++; }
    }
    for (const [tid, rec] of current) teamPreRecord.get(tid)!.set(r, `${rec.w}-${rec.l}`);
  }

  const roundData: { round: number; groups: { record: string; matches: Match[] }[] }[] = [];
  for (let r = 1; r <= 5; r++) {
    const matches = stage.matches.filter(m => m.round === r);
    if (matches.length === 0) continue;
    const groups = new Map<string, Match[]>();
    for (const m of matches) {
      const preRec = teamPreRecord.get(m.teamA)!.get(r - 1) || '0-0';
      if (!groups.has(preRec)) groups.set(preRec, []);
      groups.get(preRec)!.push(m);
    }
    roundData.push({
      round: r,
      groups: Array.from(groups.entries()).sort(([a], [b]) => {
        const wa = parseInt(a), la = parseInt(a.split('-')[1]);
        const wb = parseInt(b), lb = parseInt(b.split('-')[1]);
        return wb - wa || la - lb;
      }).map(([record, matches]) => ({ record, matches })),
    });
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'flex', gap: 20, minWidth: roundData.length * 340 }}>
        {roundData.map(({ round, groups }) => (
          <div key={round} style={{
            flex: '0 0 340px',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--accent)' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f' }}>第 {round} 轮</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {groups.reduce((s, g) => s + g.matches.length, 0)} 场比赛
              </div>
            </div>
            <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {groups.map(({ record, matches }) => (
                <div key={record}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      padding: '3px 12px', borderRadius: 7,
                      background: record.startsWith('2') ? 'rgba(52,199,89,0.1)' :
                                  (record.startsWith('0') && record.endsWith('2')) || (record.startsWith('1') && record.endsWith('2'))
                                    ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.06)',
                      color: record.startsWith('2') ? 'var(--win)' :
                             (record.startsWith('0') && record.endsWith('2')) || (record.startsWith('1') && record.endsWith('2'))
                               ? 'var(--loss)' : 'var(--accent)',
                    }}>
                      战绩 {record}
                      {record.startsWith('2') ? ' · 胜者晋级' : ''}
                      {(record.startsWith('0') && record.endsWith('2')) || (record.startsWith('1') && record.endsWith('2')) ? ' · 败者淘汰' : ''}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{matches.length} 场</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {matches.map(m => <SwissMatchCard key={m.id} match={m} record={record} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SwissMatchCard({ match, record }: { match: Match; record: string }) {
  const tA = getTeam(match.teamA);
  const tB = getTeam(match.teamB);
  const aWon = match.winner === tA.id;
  const bWon = match.winner === tB.id;
  const wins = parseInt(record);
  const losses = parseInt(record.split('-')[1]);
  const isAdvMatch = wins === 2;
  const isElimMatch = losses === 2;

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', fontWeight: aWon ? 640 : 420,
        color: aWon ? '#1d1d1f' : 'var(--text-secondary)', fontSize: 14,
        borderRadius: 6, background: aWon ? 'rgba(52,199,89,0.05)' : 'transparent',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(145deg, ${tA.color}, ${tA.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{tA.shortName}</div>
        <span style={{ flex: 1 }}>{tA.name}</span>
        {aWon && isAdvMatch && <span style={{ color: 'var(--win)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>晋级 ✓</span>}
        {aWon && !isAdvMatch && <span style={{ color: 'var(--win)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>W</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '5px 12px' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', background: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: 5 }}>{match.matchType.toUpperCase()}</span>
        {isAdvMatch && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--win)', background: 'rgba(52,199,89,0.08)', padding: '2px 8px', borderRadius: 5 }}>晋级赛</span>}
        {isElimMatch && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--loss)', background: 'rgba(255,59,48,0.08)', padding: '2px 8px', borderRadius: 5 }}>淘汰赛</span>}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', fontWeight: bWon ? 640 : 420,
        color: bWon ? '#1d1d1f' : 'var(--text-secondary)', fontSize: 14,
        borderRadius: 6, background: bWon ? 'rgba(52,199,89,0.05)' : 'transparent',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(145deg, ${tB.color}, ${tB.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{tB.shortName}</div>
        <span style={{ flex: 1 }}>{tB.name}</span>
        {bWon && isAdvMatch && <span style={{ color: 'var(--win)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>晋级 ✓</span>}
        {bWon && !isAdvMatch && <span style={{ color: 'var(--win)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>W</span>}
      </div>
    </div>
  );
}
