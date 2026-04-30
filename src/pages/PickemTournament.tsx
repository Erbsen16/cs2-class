import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournaments, type RealTeam, type RealMatch, type RealTournament } from '../engine/tournamentData';

const teamCache = new Map<string, RealTeam>();
Object.values(tournaments).forEach(({ teams }) => teams.forEach(t => teamCache.set(t.id, t)));
function gt(id: string): RealTeam {
  return teamCache.get(id) || { id, name: id, shortName: id.slice(0, 3).toUpperCase(), region: '—', rank: 99, color: '#888' };
}

export default function PickemTournament() {
  const { id } = useParams<{ id: string }>();
  const data = tournaments[id || 'major'];
  if (!data) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>赛事数据加载中...</div>;

  const { info, teams } = data;
  const hasTeams = teams.length > 0;
  const [stageIdx, setStageIdx] = useState(0);
  const stage = info.stages[stageIdx];

  // For pseudo-pickem: track which teams are placed in which slots
  const [filled, setFilled] = useState<Record<string, string>>({}); // slotId → teamId
  const [dragTeam, setDragTeam] = useState<string | null>(null);

  const handleDrop = useCallback((slotId: string) => {
    if (dragTeam) {
      setFilled(prev => ({ ...prev, [slotId]: dragTeam }));
      setDragTeam(null);
    }
  }, [dragTeam]);

  const handleSlotClick = useCallback((slotId: string) => {
    if (dragTeam) { setFilled(prev => ({ ...prev, [slotId]: dragTeam })); setDragTeam(null); return; }
    setFilled(prev => { const n = { ...prev }; delete n[slotId]; return n; });
  }, [dragTeam]);

  // Determine if matches have results
  const allMatches = (stage.groups || []).flatMap(g => g.matches);
  const hasResults = allMatches.some(m => m.played);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 24px 72px' }} className="page-enter">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>← 返回首页</Link>
        <div style={{ fontSize: 32, marginTop: 6 }}>{info.icon}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1d1d1f', marginTop: 4, letterSpacing: -0.6 }}>{info.fullName}</h1>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <span>{info.dates}</span><span>·</span><span>{info.location}</span><span>·</span><span>{info.prize}</span><span>·</span><span>{info.format}</span>
        </div>
      </div>

      {/* Stage tabs */}
      {info.stages.length > 1 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 28 }}>
          {info.stages.map((s, i) => (
            <button key={i} onClick={() => setStageIdx(i)} style={{
              padding: '8px 20px', borderRadius: 10,
              border: i === stageIdx ? `1.5px solid ${info.color}` : '1px solid var(--border)',
              background: i === stageIdx ? `${info.color}10` : 'white',
              fontSize: 13, fontWeight: i === stageIdx ? 600 : 420,
              color: i === stageIdx ? '#1d1d1f' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{s.name}</button>
          ))}
        </div>
      )}

      {/* Team sticker pool (for pseudo-pickem: has teams but no results) */}
      {hasTeams && !hasResults && (
        <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>队伍池（拖入下方空格）</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 48, alignItems: 'center' }}>
            {teams.filter(t => !Object.values(filled).includes(t.id)).map(t => (
              <div key={t.id} draggable onDragStart={() => setDragTeam(t.id)} onDragEnd={() => setDragTeam(null)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px 6px 8px', background: 'white', border: '1px solid var(--border)',
                  borderRadius: 10, cursor: 'grab', userSelect: 'none',
                  opacity: dragTeam === t.id ? 0.4 : 1, transition: 'opacity 0.15s',
                }}>
                <TeamBadge team={t} size={32} />
                <span style={{ fontSize: 13, fontWeight: 540 }}>{t.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>#{t.rank}</span>
              </div>
            ))}
            {teams.filter(t => !Object.values(filled).includes(t.id)).length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>所有队伍已放置 ✓</span>
            )}
          </div>
        </div>
      )}

      {/* Stage content */}
      <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 640, marginBottom: 4, color: '#1d1d1f' }}>{stage.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>{stage.desc}</p>

        {!hasTeams && <ComingSoon />}
        {hasTeams && hasResults && stage.groups && <GSLViewer groups={stage.groups} />}
        {hasTeams && !hasResults && stage.groups && (
          <GSLDropViewer groups={stage.groups} filled={filled} onDrop={handleDrop} onClick={handleSlotClick} onDragOver={setDragTeam} />
        )}
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>参赛队伍名单即将公布</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>敬请期待</div>
    </div>
  );
}

/* ── GSL Viewer (with real results) ── */

function GSLViewer({ groups }: { groups: { name: string; matches: RealMatch[] }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
      {groups.map(group => (
        <div key={group.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h4 style={{ fontSize: 15, fontWeight: 640, marginBottom: 16, color: '#1d1d1f' }}>{group.name}
            <span style={{ fontSize: 12, fontWeight: 440, color: 'var(--text-secondary)', marginLeft: 6 }}>4 队 · 4 场 · 3 晋级</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {group.matches.slice(0, 2).map(m => (
                <div key={m.id} style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4 }}>{m.round}</div>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 15, color: 'var(--text-tertiary)' }}>↓ 胜者会师 ↓</div>
            {group.matches[3] && (
              <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4 }}>{group.matches[3].round}</div>
                <MatchCard match={group.matches[3]} upper />
                <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: 'var(--win)', fontWeight: 600 }}>
                  胜者 = {group.name.replace(' 组', '')}组第1 · 败者 = {group.name.replace(' 组', '')}组第2（双双晋级）
                </div>
              </div>
            )}
            {group.matches[2] && (
              <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--loss)', marginBottom: 10 }}>败者组</div>
                <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4 }}>{group.matches[2].round}</div>
                  <MatchCard match={group.matches[2]} lower />
                  <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    胜者 = {group.name.replace(' 组', '')}组第3 · 败者淘汰
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── GSL Drop Viewer (pseudo-pickem: no results, drag to fill) ── */

function GSLDropViewer({ groups, filled, onDrop, onClick, onDragOver }: {
  groups: { name: string; matches: RealMatch[] }[];
  filled: Record<string, string>;
  onDrop: (slotId: string) => void;
  onClick: (slotId: string) => void;
  onDragOver: (teamId: string | null) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
      {groups.map(group => (
        <div key={group.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h4 style={{ fontSize: 15, fontWeight: 640, marginBottom: 16, color: '#1d1d1f' }}>{group.name}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {group.matches.slice(0, 2).map(m => (
                <div key={m.id} style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4 }}>{m.round}</div>
                  <DropMatch match={m} filled={filled} onDrop={onDrop} onClick={onClick} onDragOver={onDragOver} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', padding: '4px 0' }}>↓ 胜者 ↓</div>
            {group.matches[3] && (
              <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                <DropMatch match={group.matches[3]} filled={filled} onDrop={onDrop} onClick={onClick} onDragOver={onDragOver} />
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--loss)', marginBottom: 8 }}>败者组</div>
              {group.matches[2] && (
                <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                  <DropMatch match={group.matches[2]} filled={filled} onDrop={onDrop} onClick={onClick} onDragOver={onDragOver} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Match Card (real results) ── */

function MatchCard({ match, upper, lower }: { match: RealMatch; upper?: boolean; lower?: boolean }) {
  const a = gt(match.teamA), b = gt(match.teamB);
  const border = upper ? '1.5px solid rgba(0,122,255,0.25)' : lower ? '1.5px solid rgba(255,59,48,0.18)' : '1px solid var(--border)';
  const bg = upper ? 'rgba(0,122,255,0.02)' : 'white';

  return (
    <div style={{ background: bg, border, borderRadius: 12, overflow: 'hidden' }}>
      <MatchRow team={a} winner={match.winner} isA />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '5px 12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', background: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: 5 }}>{match.matchType}</span>
        {match.played && match.score ? <span style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>{match.score}</span> : <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>即将开始</span>}
        {match.date && <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{match.date}</span>}
      </div>
      <MatchRow team={b} winner={match.winner} />
    </div>
  );
}

function MatchRow({ team, winner, isA }: { team: RealTeam; winner: string | null; isA?: boolean }) {
  const won = winner === team.id;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontWeight: won ? 640 : 420, color: won ? '#1d1d1f' : 'var(--text-secondary)', fontSize: 14, background: won ? 'rgba(52,199,89,0.05)' : 'transparent' }}>
      <TeamBadge team={team} size={32} />
      <span style={{ flex: 1 }}>{team.name}</span>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>#{team.rank}</span>
      {won && <span style={{ color: 'var(--win)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>W</span>}
    </div>
  );
}

/* ── Drop Match (pseudo-pickem) ── */

function DropMatch({ match, filled, onDrop, onClick, onDragOver }: {
  match: RealMatch; filled: Record<string, string>; onDrop: (id: string) => void; onClick: (id: string) => void; onDragOver: (id: string | null) => void;
}) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <DropSlot slotId={`${match.id}-a`} teamId={filled[`${match.id}-a`]} onDrop={onDrop} onClick={onClick} onDragOver={onDragOver} />
      <div style={{ textAlign: 'center', padding: '5px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>VS</div>
      <DropSlot slotId={`${match.id}-b`} teamId={filled[`${match.id}-b`]} onDrop={onDrop} onClick={onClick} onDragOver={onDragOver} />
    </div>
  );
}

function DropSlot({ slotId, teamId, onDrop, onClick, onDragOver }: {
  slotId: string; teamId: string | undefined; onDrop: (id: string) => void; onClick: (id: string) => void; onDragOver: (id: string | null) => void;
}) {
  const team = teamId ? gt(teamId) : null;
  return (
    <div
      onClick={() => onClick(slotId)}
      onDragOver={e => { e.preventDefault(); onDragOver(slotId); }}
      onDragLeave={() => onDragOver(null)}
      onDrop={e => { e.preventDefault(); onDrop(slotId); }}
      style={{
        minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: team ? 'pointer' : 'default',
        background: team ? 'rgba(52,199,89,0.04)' : 'transparent',
        padding: '8px 14px',
      }}
    >
      {team ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <TeamBadge team={team} size={32} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{team.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>#{team.rank} · {team.region}</div>
          </div>
        </div>
      ) : (
        <span style={{ fontSize: 20, color: 'var(--text-tertiary)', fontWeight: 300 }}>?</span>
      )}
    </div>
  );
}

function TeamBadge({ team, size }: { team: RealTeam; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 4, flexShrink: 0,
      background: `linear-gradient(145deg, ${team.color}, ${team.color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size / 2.8, fontWeight: 700, color: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
    }}>
      {team.shortName.slice(0, 3)}
    </div>
  );
}
