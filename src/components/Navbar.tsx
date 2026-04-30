import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: '首页' },
  { to: '/swiss', label: '瑞士轮' },
  { to: '/gsl', label: 'GSL 双败' },
  { to: '/playoffs', label: '单败淘汰' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky',
      top: 12,
      zIndex: 100,
      margin: '0 auto',
      maxWidth: 560,
      padding: '0 8px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: 50,
        padding: '0 8px',
        background: 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 28,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
      }}>
        <Link to="/" style={{
          fontWeight: 640,
          fontSize: 15,
          color: 'var(--text-primary)',
          textDecoration: 'none',
          marginRight: 8,
          padding: '6px 14px',
          letterSpacing: -0.3,
        }}>
          赛制课堂
        </Link>
        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)', marginRight: 4 }} />
        {links.slice(1).map(link => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '7px 15px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: active ? 590 : 440,
                color: active ? '#fff' : 'var(--text-secondary)',
                background: active ? 'var(--accent)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                letterSpacing: -0.2,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
