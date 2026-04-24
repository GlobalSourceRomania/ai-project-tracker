'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          router.push('/projects');
          return;
        }
      } catch {
        // ignore
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
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
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <div className="login-wrap">
      {/* Left: brand + hero */}
      <div className="login-left">
        <div className="login-badge">
          <span
            aria-hidden
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#8dd13a', boxShadow: '0 0 8px #8dd13a' }}
          />
          AI_TRACKER · V2.2
        </div>
        <h1 className="login-h">
          Global Source,<br />
          <span className="grad">AI projects tracking.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 440, lineHeight: 1.6, marginTop: 20 }}>
          Every project change, update, or bottleneck in one place. Built by Global Source.
        </p>
        <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
          {[
            { n: 'AI', l: 'vision', c: '#8dd13a' },
            { n: '24/7', l: 'tracking', c: '#2ba8d9' },
            { n: 'PWA', l: 'android · ios', c: '#e8863a' },
          ].map((s) => (
            <div key={s.l}>
              <div className="display" style={{ fontSize: 30, fontWeight: 700, color: s.c, letterSpacing: '-0.02em' }}>{s.n}</div>
              <div
                className="mono"
                style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: sign-in form */}
      <div className="login-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 34 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Global Source" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Global Source</div>
            <div
              className="mono"
              style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              Project Tracker
            </div>
          </div>
        </div>

        <div className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Sign in</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 26 }}>
          Use your Global Source account to continue.
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(230,75,75,0.1)',
              border: '1px solid rgba(230,75,75,0.3)',
              color: '#f7a7a7',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="you@globalsource.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14 }}
          >
            {submitting ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 16, textAlign: 'center' }}>
          Need access? Contact your admin.
        </div>
      </div>
    </div>
  );
}
