import type { SwissStage } from '../engine/types';
import { getTeam } from '../engine/teams';
import { Badge } from './RulePanel';

interface SwissTableProps {
  stage: SwissStage;
  title: string;
}

export default function SwissTable({ stage, title }: SwissTableProps) {
  const sorted = [...stage.records].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.teamId.localeCompare(b.teamId);
  });

  return (
    <div style={{
      background: 'var(--bg-card-solid)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 640, color: '#1d1d1f' }}>{title}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 440 }}>
          {stage.advanced.length} 晋级 · {stage.eliminated.length} 淘汰 · {stage.records.length - stage.advanced.length - stage.eliminated.length} 待定
        </p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
              <th style={thStyle}>#</th>
              <th style={{ ...thStyle, textAlign: 'left', minWidth: 160 }}>战队</th>
              <th style={thStyle}>战绩</th>
              <th style={thStyle}>胜</th>
              <th style={thStyle}>负</th>
              <th style={thStyle}>状态</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rec, i) => {
              const team = getTeam(rec.teamId);
              const isAdvanced = stage.advanced.includes(rec.teamId);
              const isEliminated = stage.eliminated.includes(rec.teamId);
              return (
                <tr
                  key={rec.teamId}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    opacity: isEliminated ? 0.35 : 1,
                    background: isAdvanced ? 'rgba(52,199,89,0.03)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <td style={{ ...tdStyle, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {i + 1}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: `linear-gradient(145deg, ${team.color}, ${team.secondaryColor})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}>
                        {team.shortName}
                      </div>
                      <span style={{ fontWeight: 540, color: '#1d1d1f' }}>{team.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 640, fontFamily: 'SF Mono, monospace', fontSize: 13 }}>
                      {rec.wins}-{rec.losses}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--win)', fontWeight: 600 }}>{rec.wins}</td>
                  <td style={{ ...tdStyle, color: 'var(--loss)', fontWeight: 600 }}>{rec.losses}</td>
                  <td style={tdStyle}>
                    {isAdvanced ? <Badge variant="win">晋级</Badge> :
                     isEliminated ? <Badge variant="loss">淘汰</Badge> :
                     <Badge>进行中</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--text-secondary)',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'center',
};
