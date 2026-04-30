import type { Team } from '../engine/types';

interface TeamLogoProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  dimmed?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, team: Team) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
  selected?: boolean;
}

const sizeMap = { sm: 36, md: 56, lg: 80 };

export default function TeamLogo({
  team,
  size = 'md',
  showName = true,
  dimmed = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  onClick,
  selected = false,
}: TeamLogoProps) {
  const px = sizeMap[size];
  const fontSize = size === 'lg' ? 20 : size === 'md' ? 14 : 10;

  return (
    <div
      draggable={draggable}
      onDragStart={e => {
        if (onDragStart) onDragStart(e, team);
      }}
      onDragEnd={e => {
        if (onDragEnd) onDragEnd(e);
      }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: draggable ? 'grab' : onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.35 : 1,
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: px,
        height: px,
        borderRadius: size === 'lg' ? 18 : size === 'md' ? 13 : 9,
        background: `linear-gradient(145deg, ${team.color}, ${team.secondaryColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize,
        color: '#fff',
        boxShadow: selected
          ? `0 0 0 3px rgba(0,122,255,0.25), 0 4px 12px rgba(0,0,0,0.1)`
          : '0 2px 6px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        letterSpacing: -0.5,
      }}>
        {team.shortName}
      </div>
      {showName && (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: dimmed ? 'var(--text-tertiary)' : 'var(--text-primary)',
          textAlign: 'center',
          maxWidth: px + 20,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: -0.2,
        }}>
          {team.name}
        </span>
      )}
      {size === 'lg' && (
        <span style={{
          fontSize: 10,
          padding: '3px 8px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.03)',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          #{team.seed} · {team.region}
        </span>
      )}
    </div>
  );
}
