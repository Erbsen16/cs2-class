import { useRef, useEffect, useState } from 'react';
import type { PlayoffMatch } from '../engine/types';
import { getTeam } from '../engine/teams';

interface GroupWinner {
  teamId: string;
  group: string;
}

interface SingleElimBracketProps {
  matches: PlayoffMatch[];
  champion?: string | null;
  groupWinners?: GroupWinner[] | null;
}

type ConnLine = { x1: number; y1: number; x2: number; y2: number };

export default function SingleElimBracket({ matches, champion, groupWinners }: SingleElimBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<ConnLine[]>([]);

  const qfMatches = matches.filter(m => m.round === 'qf');
  const sfMatches = matches.filter(m => m.round === 'sf');
  const finalMatch = matches.find(m => m.round === 'final');
  const isSixTeam = qfMatches.length === 2;

  // Draw connector lines between rounds
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const drawLines = () => {
      const newLines: ConnLine[] = [];
      const roundCols = container.querySelectorAll<HTMLElement>('[data-round-col]');

      if (roundCols.length < 2) return;

      for (let i = 0; i < roundCols.length - 1; i++) {
        const leftCol = roundCols[i];
        const rightCol = roundCols[i + 1];
        const leftCards = leftCol.querySelectorAll<HTMLElement>('[data-match-id]');
        const rightCards = rightCol.querySelectorAll<HTMLElement>('[data-match-id]');

        const containerRect = container.getBoundingClientRect();

        leftCards.forEach(leftCard => {
          const matchId = leftCard.dataset.matchId;
          const leftRect = leftCard.getBoundingClientRect();
          // Find connected matches: those whose matchA or matchB equals this match's winner
          const leftWinner = matches.find(m => m.id === matchId)?.winner;

          rightCards.forEach(rightCard => {
            const rightMatch = matches.find(m => m.id === rightCard.dataset.matchId);
            if (!rightMatch) return;
            // SF match references QF winner, Final references SF winner
            if (rightMatch.matchA === leftWinner || rightMatch.matchB === leftWinner) {
              const rightRect = rightCard.getBoundingClientRect();
              newLines.push({
                x1: leftRect.right - containerRect.left,
                y1: leftRect.top + leftRect.height / 2 - containerRect.top,
                x2: rightRect.left - containerRect.left,
                y2: rightRect.top + rightRect.height / 2 - containerRect.top,
              });
            }
          });
        });
      }
      setLines(newLines);
    };

    drawLines();
    window.addEventListener('resize', drawLines);
    return () => window.removeEventListener('resize', drawLines);
  }, [matches]);

  const svgW = containerRef.current?.offsetWidth || 900;
  const svgH = containerRef.current?.offsetHeight || 600;

  return (
    <div style={{
      background: 'var(--bg-card-solid)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 16px 28px',
      boxShadow: 'var(--shadow-sm)',
      overflowX: 'auto',
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 640, marginBottom: 20, color: '#1d1d1f', letterSpacing: -0.3, paddingLeft: 8 }}>
        {isSixTeam ? '季后赛对阵图 · 6 队（GSL 双败出线）' : '季后赛对阵图 · 8 队（瑞士轮出线）'}
      </h3>

      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 0,
          minWidth: isSixTeam ? 720 : 800,
          position: 'relative',
        }}
      >
        {/* SVG connector lines */}
        <svg style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}>
          {lines.map((l, i) => (
            <g key={i}>
              {/* Horizontal from left card */}
              <line x1={l.x1} y1={l.y1} x2={l.x1 + 24} y2={l.y1}
                stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
              {/* Horizontal to right card */}
              <line x1={l.x2 - 24} y1={l.y2} x2={l.x2} y2={l.y2}
                stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
              {/* Vertical connection */}
              <line x1={l.x1 + 24} y1={l.y1} x2={l.x1 + 24} y2={l.y2}
                stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
            </g>
          ))}
        </svg>

        {/* Bracket columns */}
        {isSixTeam ? (
          <SixTeamColumns
            qfMatches={qfMatches}
            sfMatches={sfMatches}
            finalMatch={finalMatch}
            champion={champion}
            groupWinners={groupWinners}
          />
        ) : (
          <EightTeamColumns
            qfMatches={qfMatches}
            sfMatches={sfMatches}
            finalMatch={finalMatch}
            champion={champion}
          />
        )}
      </div>
    </div>
  );
}

/* ── 8-team bracket ── */
function EightTeamColumns({
  qfMatches, sfMatches, finalMatch, champion,
}: {
  qfMatches: PlayoffMatch[];
  sfMatches: PlayoffMatch[];
  finalMatch?: PlayoffMatch;
  champion?: string | null;
}) {
  // 8-team: QF → SF → Final
  // QF: 4 matches, evenly spaced. SF: 2 matches between QF pairs. Final: 1 match centered.
  return (
    <>
      <RoundColumn label="四分之一决赛 · BO3" round="qf">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, height: '100%' }}>
          {qfMatches.map(m => (
            <MatchSlot key={m.id} match={m} />
          ))}
        </div>
      </RoundColumn>

      <Spacer />

      <RoundColumn label="半决赛 · BO3" round="sf">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 48, height: '100%' }}>
          {sfMatches.map(m => (
            <MatchSlot key={m.id} match={m} />
          ))}
        </div>
      </RoundColumn>

      <Spacer />

      <RoundColumn label="总决赛 · BO5" round="final" accent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {finalMatch && <MatchSlot match={finalMatch} isFinal champion={champion} />}
        </div>
      </RoundColumn>
    </>
  );
}

/* ── 6-team bracket ── */
function SixTeamColumns({
  qfMatches, sfMatches, finalMatch, champion, groupWinners,
}: {
  qfMatches: PlayoffMatch[];
  sfMatches: PlayoffMatch[];
  finalMatch?: PlayoffMatch;
  champion?: string | null;
  groupWinners?: GroupWinner[] | null;
}) {
  return (
    <>
      {/* Bye label + QF column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: '0 0 auto' }}>
        <RoundColumn label="四分之一决赛 · BO3" round="qf" compact>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, height: '100%' }}>
            {qfMatches.map(m => (
              <div key={m.id}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 4 }}>
                  交叉对阵（各组第 2 vs 第 3）
                </div>
                <MatchSlot match={m} />
              </div>
            ))}
          </div>
        </RoundColumn>
      </div>

      <Spacer />

      {/* SF column with bye labels */}
      <RoundColumn label="半决赛 · BO3" round="sf">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, height: '100%' }}>
          {sfMatches.map(m => {
            const byeTeamId = [m.matchA, m.matchB].find(id => {
              // The bye team is the one that didn't come from QF
              const fromQf = qfMatches.some(qf => qf.winner === id);
              return !fromQf;
            });
            const qfWinnerId = [m.matchA, m.matchB].find(id => id !== byeTeamId);

            return (
              <div key={m.id} data-match-id={m.id} style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '8px 0',
                position: 'relative',
              }}>
                {/* Bye team at top */}
                {byeTeamId && (
                  <div style={{ padding: '2px 8px 4px' }}>
                    <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600, marginBottom: 3 }}>
                      {(groupWinners?.find(w => w.teamId === byeTeamId)?.group ?? '?')} 组第 1 · 轮空
                    </div>
                    <TeamRow teamId={byeTeamId} isWinner={m.winner === byeTeamId} />
                  </div>
                )}
                {/* VS divider */}
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-tertiary)', padding: '2px 0' }}>VS</div>
                {/* QF winner at bottom */}
                {qfWinnerId && (
                  <div style={{ padding: '2px 8px 4px' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 3 }}>
                      四分之一决赛胜者
                    </div>
                    <TeamRow teamId={qfWinnerId} isWinner={m.winner === qfWinnerId} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </RoundColumn>

      <Spacer />

      <RoundColumn label="总决赛 · BO5" round="final" accent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {finalMatch && <MatchSlot match={finalMatch} isFinal champion={champion} />}
        </div>
      </RoundColumn>
    </>
  );
}

/* ── Reusable pieces ── */

function RoundColumn({ label, round, accent, compact, children }: {
  label: string; round: string; accent?: boolean; compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-round-col
      style={{
        flex: compact ? '0 0 190px' : '0 0 200px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        minHeight: 440,
      }}
    >
      <div style={{
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 14,
        padding: '4px 0',
        borderBottom: accent ? '2px solid rgba(0,122,255,0.2)' : '1px solid var(--border)',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Spacer() {
  return <div style={{ flex: '0 0 48px', position: 'relative', zIndex: 1 }} />;
}

function MatchSlot({ match, isFinal, champion }: {
  match: PlayoffMatch;
  isFinal?: boolean;
  champion?: string | null;
}) {
  const border = isFinal ? '2px solid rgba(0,122,255,0.2)' : '1px solid var(--border)';
  const shadow = isFinal ? '0 2px 12px rgba(0,122,255,0.06)' : 'none';
  return (
    <div
      data-match-id={match.id}
      style={{
        background: 'white',
        border,
        borderRadius: 12,
        padding: '6px 0',
        boxShadow: shadow,
        minWidth: 160,
      }}
    >
      <TeamRow teamId={match.matchA} isWinner={match.winner === match.matchA} />
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-tertiary)', padding: '2px 0', letterSpacing: 1 }}>VS</div>
      <TeamRow teamId={match.matchB} isWinner={match.winner === match.matchB} />
      {isFinal && champion && match.winner && (
        <div style={{
          margin: '8px 8px 4px',
          textAlign: 'center',
          padding: '6px 10px',
          background: 'rgba(0,122,255,0.06)',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 640,
          color: 'var(--accent)',
        }}>
          🏆 {getTeam(match.winner).name}
        </div>
      )}
    </div>
  );
}

function TeamRow({ teamId, isWinner }: { teamId: string; isWinner: boolean }) {
  const team = getTeam(teamId);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 10px',
      fontWeight: isWinner ? 640 : 420,
      color: isWinner ? '#1d1d1f' : 'var(--text-secondary)',
      fontSize: 14,
      borderRadius: 6,
      background: isWinner ? 'rgba(52,199,89,0.05)' : 'transparent',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: `linear-gradient(145deg, ${team.color}, ${team.secondaryColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff',
        flexShrink: 0,
      }}>{team.shortName}</div>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team.name}
      </span>
      {isWinner && <span style={{ marginLeft: 'auto', color: 'var(--win)', fontSize: 11 }}>✓</span>}
    </div>
  );
}
