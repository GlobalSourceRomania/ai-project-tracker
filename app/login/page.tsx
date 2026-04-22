'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClass = 'w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4EF]/70 focus:bg-white/[0.09] transition-all text-sm';
const btnBlue = 'w-full px-4 py-3 bg-[#00B4EF]/10 border border-[#00B4EF]/40 text-[#00B4EF] rounded-xl text-sm font-medium hover:bg-[#00B4EF]/20 transition-colors';
const cardClass = 'bg-white/[0.03] rounded-2xl border border-white/[0.07] p-6';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/projects');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${cardClass}`}>
        <h1 className="text-2xl font-bold text-white mb-2">AI Project Tracker</h1>
        <p className="text-white/50 mb-6 text-sm">Sign in to manage projects</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
          <button type="submit" disabled={loading} className={btnBlue}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-white/40 text-xs mt-6 text-center">
          Default: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
