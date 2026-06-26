import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Search', path: '/search' },
    { name: 'Mapping', path: '/mapping' },
    { name: 'Bundle Viewer', path: '/bundle' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-emerald-950/70 border-b border-emerald-800/30 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center font-bold text-emerald-950 shadow-lg shadow-emerald-500/20">
                🌱
              </span>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                AyushBridge
              </span>
            </NavLink>
          </div>

          {/* Main Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-inner'
                      : 'text-emerald-100/70 hover:text-emerald-200 hover:bg-emerald-800/20 border border-transparent'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* User Auth Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated() && user ? (
              <>
                <span className="text-xs text-emerald-300 font-semibold px-2 py-1 rounded-md bg-emerald-900/40 border border-emerald-500/10">
                  👤 {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-emerald-300'
                        : 'text-emerald-100/70 hover:text-emerald-200'
                    }`
                  }
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 hover:scale-[1.02]"
                >
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

