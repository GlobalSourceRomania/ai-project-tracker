'use client';

/**
 * Full-screen loading spinner used on auth-gated routes.
 * Animated gradient ring over the Global Source logo.
 */
export default function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 18,
      }}
    >
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #8dd13a, #2ba8d9, transparent, #8dd13a)',
            animation: 'spin 1.8s linear infinite',
            padding: 3,
            WebkitMask: 'radial-gradient(circle, transparent 50%, black 50%)',
            mask: 'radial-gradient(circle, transparent 50%, black 50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: '50%',
            background: 'rgba(11,15,21,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>
      </div>

      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        Loading projects…
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
