import type { ReactNode } from 'react';

interface RulePanelProps {
  title: string;
  icon: string;
  children: ReactNode;
}

export default function RulePanel({ title, icon, children }: RulePanelProps) {
  return (
    <div style={{
      background: 'var(--bg-card-solid)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      height: 'fit-content',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 88,
    }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 640,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#1d1d1f',
        letterSpacing: -0.3,
      }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {title}
      </h2>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div style={{
      marginTop: 16,
      padding: '12px 15px',
      background: 'rgba(0,122,255,0.04)',
      borderLeft: '3px solid var(--accent)',
      borderRadius: '0 10px 10px 0',
      fontSize: 12,
      color: '#1d1d1f',
      lineHeight: 1.7,
    }}>
      {children}
    </div>
  );
}

export function Badge({ variant = 'default', children }: { variant?: 'win' | 'loss' | 'default'; children: ReactNode }) {
  const colors = {
    win: { bg: 'rgba(52,199,89,0.08)', text: 'var(--win)', border: 'rgba(52,199,89,0.2)' },
    loss: { bg: 'rgba(255,59,48,0.08)', text: 'var(--loss)', border: 'rgba(255,59,48,0.2)' },
    default: { bg: 'rgba(0,0,0,0.03)', text: 'var(--text-secondary)', border: 'var(--border)' },
  };
  const c = colors[variant];

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 7,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: -0.2,
    }}>
      {children}
    </span>
  );
}
