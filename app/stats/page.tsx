'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Icon from '@/components/Icon';

type Project = {
  id: number;
  title: string;
  pipedrive_code: string;
  owner_id: number;
  status: 'planning' | 'in_progress' | 'waiting' | 'bottleneck' | 'completed';
  description: string | null;
  bottleneck: string | null;
  created_at: string;
  tasks_total: number;
  tasks_done: number;
};

type Me = { id: number; email: string; display_name?: string; role: 'admin' | 'editor' | 'viewer' };

const statusOrder: Record<string, number> = {
  'in_progress': 1,
  'waiting': 2,
  'planning': 3,
  'demo': 3.5,
  'bottleneck': 2.5,
  'completed': 4,
};

const statusColor: Record<string, string> = {
  'in_progress': '#8dd13a',
  'waiting': '#e8a73a',
  'planning': '#aab3c5',
  'demo': '#7b68ee',
  'bottleneck': '#e8863a',
  'completed': '#2ba8d9',
};

function getDaysOpen(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

function getActivityRatio(project: Project): number {
  const daysOpen = Math.max(getDaysOpen(project.created_at), 1);
  const totalActivity = project.tasks_done + project.tasks_total; // Approximation
  return +(totalActivity / daysOpen).toFixed(1);
}

function getCompletion(project: Project): number {
  if (project.tasks_total === 0) return 0;
  return Math.round((project.tasks_done / project.tasks_total) * 100);
}

export default function StatsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meRes, projectsRes] = await Promise.all([fetch('/api/me'), fetch('/api/projects')]);
        if (meRes.status === 401) { router.push('/login'); return; }
        if (meRes.ok) setMe(await meRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    router.push('/login');
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const orderDiff = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [projects]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <>
      <div className="app">
        <Sidebar user={me} userCount={0} onLogout={handleLogout} />

        <main className="main">
          <div className="topbar">
            <div style={{ minWidth: 0 }}>
              <h1>Statistics</h1>
              <div className="crumb sm-hide">project overview</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
              {projects.length} projects
            </div>
          </div>

          <div style={{ padding: '20px 28px 80px' }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>
                <Icon id="chart" size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                <div>No projects yet</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {sortedProjects.map(project => {
                  const completion = getCompletion(project);
                  const daysOpen = getDaysOpen(project.created_at);
                  const activityRatio = getActivityRatio(project);
                  const color = statusColor[project.status] || '#aab3c5';

                  return (
                    <div
                      key={project.id}
                      className="card bold"
                      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => router.push(`/projects#${project.id}`)}
                    >
                      <div style={{ height: 3, background: color }} />
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Title + Code */}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                            {project.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                            {project.pipedrive_code}
                          </div>
                        </div>

                        {/* Completion Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontSize: 10, color: 'var(--ink-2)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                              Completion
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color }}>
                              {completion}%
                            </div>
                          </div>
                          <div className="progress">
                            <span style={{ width: `${completion}%` }} />
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                          <div>
                            <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
                              Days Open
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                              {daysOpen}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
                              Activity/day
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                              {activityRatio}
                            </div>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <div style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                          <span
                            className={`chip st-${project.status}`}
                            style={{ fontSize: 10, textTransform: 'capitalize' }}
                          >
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileTabBar role={me?.role} />
    </>
  );
}
