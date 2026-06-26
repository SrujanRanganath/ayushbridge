import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Main content body with page transitions */}
      <main className="flex-1 w-full mx-auto">
        <Outlet />
      </main>

      {/* Basic Footer */}
      <footer className="border-t border-emerald-800/20 py-6 bg-emerald-950/40 text-center text-xs text-emerald-400/40">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} AyushBridge. Bridging AYUSH Systems with Global Clinical Standards.</p>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
