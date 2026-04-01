import { Outlet, NavLink, useLocation } from 'react-router';
import { useState } from 'react';
import { Menu, X, Flame, BookOpen, Puzzle, Home } from 'lucide-react';

function OwlLogoMini() {
  return (
    <svg viewBox="0 0 36 36" width="36" height="36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#EDE9FE" />
      <ellipse cx="18" cy="20" rx="12" ry="13" fill="#C4B5FD" />
      <ellipse cx="18" cy="23" rx="7" ry="9" fill="#EDE9FE" />
      <ellipse cx="12" cy="10" rx="4" ry="7" fill="#A78BFA" transform="rotate(-20 12 10)" />
      <ellipse cx="24" cy="10" rx="4" ry="7" fill="#A78BFA" transform="rotate(20 24 10)" />
      <rect x="9" y="13" width="18" height="3" rx="1.5" fill="#2D1B69" />
      <rect x="12" y="5" width="12" height="10" rx="3" fill="#2D1B69" />
      <rect x="12" y="11" width="12" height="3" fill="#7C3AED" rx="0.5" />
      <circle cx="14" cy="20" r="4.5" fill="white" />
      <circle cx="22" cy="20" r="4.5" fill="white" />
      <circle cx="14" cy="20" r="2.8" fill="#FCD34D" />
      <circle cx="22" cy="20" r="2.8" fill="#FCD34D" />
      <circle cx="14" cy="20" r="1.5" fill="#1E1B4B" />
      <circle cx="22" cy="20" r="1.5" fill="#1E1B4B" />
      <circle cx="15" cy="19" r="0.6" fill="white" />
      <circle cx="23" cy="19" r="0.6" fill="white" />
      <polygon points="18,24 15,27 21,27" fill="#F97316" />
    </svg>
  );
}

export function Root() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/learn', label: 'Learn', icon: BookOpen },
    { to: '/puzzle', label: 'Daily Puzzle', icon: Puzzle },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #FFF8F5 40%, #F0FDF9 100%)', fontFamily: "'Nunito', sans-serif" }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[#EDE9FE]" style={{ background: 'rgba(255,255,255,0.85)' }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 no-underline">
            <OwlLogoMini />
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.35rem', color: '#5B21B6', letterSpacing: '-0.01em' }}>
              CrypticOwl
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm transition-all no-underline font-semibold ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-md'
                      : 'text-[#6D28D9] hover:bg-[#F5F0FF]'
                  }`
                }
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Streak + Mobile Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-3 py-1.5">
              <span className="text-base">🔥</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#EA580C' }}>3</span>
              <span style={{ fontSize: '0.72rem', color: '#C2410C', fontWeight: 600 }}>streak</span>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-[#F5F0FF] text-[#6D28D9] transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#EDE9FE] px-4 py-3 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.95)' }}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm no-underline font-semibold transition-all ${
                    isActive ? 'bg-[#7C3AED] text-white' : 'text-[#6D28D9] hover:bg-[#F5F0FF]'
                  }`
                }
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
