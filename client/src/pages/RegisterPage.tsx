import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      <div className="max-w-lg w-full space-y-8 p-8 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="text-center">
          <span className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 items-center justify-center font-bold text-emerald-950 text-xl shadow-lg shadow-emerald-500/25 mb-4">
            🌱
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-emerald-300/80">
            Join AyushBridge to standardise traditional medicine systems
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-emerald-200">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                placeholder="Dr. Ayush Sharma"
              />
            </div>
            <div>
              <label htmlFor="affiliation" className="block text-sm font-medium text-emerald-200">
                AYUSH Stream / Affiliation
              </label>
              <select
                id="affiliation"
                name="affiliation"
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300 placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
              >
                <option value="ayurveda">Ayurveda</option>
                <option value="yoga">Yoga & Naturopathy</option>
                <option value="unani">Unani</option>
                <option value="siddha">Siddha</option>
                <option value="homeopathy">Homeopathy</option>
                <option value="other">Research/Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-200">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
              placeholder="sharma@ayushbridge.org"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-200">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-start text-sm mt-4">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 bg-emerald-950 border-emerald-500/30 rounded text-emerald-500 focus:ring-emerald-400"
            />
            <label htmlFor="terms" className="ml-2 text-emerald-200/70">
              I agree to the terms, conditions, and ethics of data integration.
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-emerald-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-[1.01] shadow-lg shadow-emerald-500/20"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-emerald-200/60 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
