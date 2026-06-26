import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Visual accents */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="text-center">
          <span className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 items-center justify-center font-bold text-emerald-950 text-xl shadow-lg shadow-emerald-500/25 mb-4 animate-pulse">
            🌱
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-emerald-300/80">
            Sign in to manage AYUSH clinical metadata
          </p>
        </div>

        {/* Error Alert Panel */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-200">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                placeholder="you@ayushbridge.org"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-emerald-950 border-emerald-500/30 rounded text-emerald-500 focus:ring-emerald-400"
              />
              <label htmlFor="remember-me" className="ml-2 text-emerald-200/80">
                Remember me
              </label>
            </div>

            <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-emerald-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-[1.01] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-emerald-200/60 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;
