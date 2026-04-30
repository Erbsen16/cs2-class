import type { GSLGroup } from '../engine/types';
import { getTeam } from '../engine/teams';

interface GslBracketProps { groups: GSLGroup[] }

export default function GslBracket({ groups }: GslBracketProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map((g, i) => (
        <GslGroupView key={g.name} group={g} label={String.fromCharCode(65 + i)} />
      ))}
    </div>
  );
}

function GslGroupView({ group, label }: { group: GSLGroup; label: string }) {
  const [m1, m2, m3, m4] = group.matches; // M1=1v4, M2=2v3, M3=losers, M4=upper final
  const m4L = m4.winner === m4.teamA ? m4.teamB : m4.teamA;
  const m3L = m3.winner === m3.teamA ? m3.teamB : m3.teamA;

  return (
    <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 640, marginBottom: 18, color: '#1d1d1f', letterSpacing: -0.3 }}>
        {label} 组 <span style={{ fontSize: 12, fontWeight: 440, color: 'var(--text-secondary)', marginLeft: 6 }}>4 队 · 4 场比赛 · 3 晋级 · 1 淘汰</span>
      </h3>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* LEFT: 胜者组 */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <SectionTitle text="胜者组" color="var(--accent)" />
          <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
            <div style={{ flex: 1 }}><MNode match={m1} sub="#1 vs #4" /></div>
            <div style={{ flex: 1 }}><MNode match={m2} sub="#2 vs #3" /></div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 16, color: 'var(--accent)' }}>↓ 胜者会师 ↓</div>
          <MNode match={m4} sub="胜者组决赛" accent />
          <div style={{ textAlign: 'center', padding: '10px 0 6px', fontSize: 12, color: 'var(--text-secondary)' }}>
            胜者 → <span style={{ color: 'var(--win)', fontWeight: 600 }}>{label}组第1</span>
            <span style={{ margin: '0 8px' }}>|</span>
            败者 → <span style={{ fontWeight: 600 }}>{label}组第2</span>
            <span style={{ marginLeft: 6, color: 'var(--win)', fontWeight: 600 }}>双双晋级 ✓</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <OutBadge teamId={m4.winner!} rank={`${label}组第1`} />
            <OutBadge teamId={m4L} rank={`${label}组第2`} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', flexShrink: 0, minHeight: 280 }} />

        {/* RIGHT: 败者组 */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <SectionTitle text="败者组" color="var(--loss)" />
          <MNode match={m3} sub="首轮败者 · 输者淘汰" loss />
          <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 16, color: 'var(--loss)' }}>↓</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <OutBadge teamId={m3.winner!} rank={`${label}组第3`} />
            <OutBadge teamId={m3L} rank="淘汰" loss />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${color}22` }}>
      {text}
    </div>
  );
}

function MNode({ match, sub, accent, loss }: {
  match: { teamA: string; teamB: string; winner: string | null };
  sub?: string; accent?: boolean; loss?: boolean;
}) {
  const border = accent ? '1px solid rgba(0,122,255,0.2)' : loss ? '1px solid rgba(255,59,48,0.15)' : '1px solid var(--border)';
  return (
    <div style={{ background: 'white', border, borderRadius: 10, padding: '4px 0' }}>
      {sub && <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textAlign: 'center', padding: '1px 0' }}>{sub}</div>}
      <TRow teamId={match.teamA} win={match.winner === match.teamA} />
      <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-tertiary)', padding: '1px 0', letterSpacing: 1 }}>VS</div>
      <TRow teamId={match.teamB} win={match.winner === match.teamB} />
    </div>
  );
}

function OutBadge({ teamId, rank, loss }: { teamId: string; rank: string; loss?: boolean }) {
  const t = getTeam(teamId);
  const isElim = !!loss;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      padding: '8px 12px',
      background: isElim ? 'rgba(255,59,48,0.04)' : 'rgba(52,199,89,0.05)',
      border: isElim ? '1px solid rgba(255,59,48,0.12)' : '1px solid rgba(52,199,89,0.15)',
      borderRadius: 12, minWidth: 100,
      opacity: isElim ? 0.5 : 1,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(145deg, ${t.color}, ${t.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{t.shortName}</div>
      <span style={{ fontSize: 9, fontWeight: 600, color: isElim ? 'var(--loss)' : 'var(--win)' }}>{rank}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: '#1d1d1f' }}>{t.name}</span>
    </div>
  );
}

function TRow({ teamId, win }: { teamId: string; win: boolean }) {
  const t = getTeam(teamId);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 9px', fontWeight: win ? 640 : 420, color: win ? '#1d1d1f' : 'var(--text-secondary)', fontSize: 11, borderRadius: 5, background: win ? 'rgba(52,199,89,0.05)' : 'transparent' }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(145deg, ${t.color}, ${t.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.shortName}</div>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{t.name}</span>
      {win && <span style={{ color: 'var(--win)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>W</span>}
    </div>
  );
}
