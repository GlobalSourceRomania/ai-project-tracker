'use client';

/**
 * Skeleton for a single kanban project card.
 */
export function ProjectCardSkeleton() {
  return (
    <div className="card bold" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 3, background: 'var(--line-2)' }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="shimmer" style={{ height: 10, width: 70, borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 14, width: '80%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 12, width: '60%', borderRadius: 4 }} />
        <div className="progress segmented">
          {Array.from({ length: 10 }).map((_, i) => <i key={i} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="shimmer" style={{ width: 22, height: 22, borderRadius: '50%' }} />
          <div className="shimmer" style={{ height: 10, width: 60, borderRadius: 4 }} />
          <div style={{ flex: 1 }} />
          <div className="shimmer" style={{ height: 10, width: 28, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Full kanban-shaped skeleton shown while `/projects` hydrates.
 */
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  const cols = ['Planning', 'In Progress', 'Waiting', 'Bottleneck', 'Completed'];
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Topbar placeholder */}
      <div className="topbar">
        <div style={{ minWidth: 0 }}>
          <div className="shimmer" style={{ height: 22, width: 140, borderRadius: 6 }} />
          <div className="shimmer" style={{ height: 10, width: 180, borderRadius: 4, marginTop: 8 }} />
        </div>
        <div style={{ flex: 1 }} />
        <div className="shimmer" style={{ height: 36, width: 120, borderRadius: 8 }} />
      </div>

      {/* Stats placeholder */}
      <div className="stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat">
            <div className="shimmer" style={{ height: 10, width: 60, borderRadius: 4 }} />
            <div className="shimmer" style={{ height: 28, width: 70, borderRadius: 6, marginTop: 8 }} />
            <div className="spark" />
          </div>
        ))}
      </div>

      {/* Kanban placeholder */}
      <div className="kanban" style={{ paddingTop: 20 }}>
        {cols.map((c) => (
          <div key={c} className="kanban-col">
            <div className="kanban-head">
              <span className="hc" style={{ background: 'var(--line-2)' }} />
              <span className="ttl" style={{ color: 'var(--ink-3)' }}>{c}</span>
              <span className="cnt">·</span>
            </div>
            {Array.from({ length: Math.min(2, count) }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
