'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Icon from '@/components/Icon';

type Notification = {
  id: number;
  user_id: number;
  type: 'mention' | 'change';
  project_id: number;
  author_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  author_name?: string;
  project_name?: string;
};

type Me = { id: number; email: string; display_name?: string; role: 'admin' | 'editor' | 'viewer' };

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function InboxPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meRes, notifRes] = await Promise.all([fetch('/api/me'), fetch('/api/notifications')]);
        if (meRes.status === 401) { router.push('/login'); return; }
        if (meRes.ok) setMe(await meRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch {
        console.error('Failed to fetch inbox');
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read' }),
      });
      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
    }
    router.push(`/projects#${notification.project_id}`);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  const unread = notifications.filter(n => !n.is_read);
  const read = notifications.filter(n => n.is_read);

  return (
    <>
      <div className="app">
        <Sidebar user={me} userCount={0} onLogout={handleLogout} />

        <main className="main">
          <div className="topbar">
            <div style={{ minWidth: 0 }}>
              <h1>Inbox</h1>
              <div className="crumb sm-hide">notifications</div>
            </div>
            <div style={{ flex: 1 }} />
            {unread.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--gs-green)', fontWeight: 600 }}>
                {unread.length} unread
              </div>
            )}
          </div>

          <div style={{ padding: '20px 28px 80px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>
                <Icon id="bell" size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                <div>No notifications yet</div>
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12, letterSpacing: '0.1em' }}>
                      Unread
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
                      {unread.map(notif => (
                        <div
                          key={notif.id}
                          className="card bold"
                          style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div style={{ height: 3, background: notif.type === 'mention' ? 'var(--gs-blue)' : 'var(--gs-green)' }} />
                          <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: notif.type === 'mention' ? 'var(--gs-blue)' : 'var(--gs-green)',
                                marginTop: 6,
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                                {notif.author_name || 'Unknown'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>
                                {notif.type === 'mention' ? `mentioned you in ${notif.project_name}` : `updated ${notif.project_name}`}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>
                                {notif.message}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                              <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                                {formatTime(notif.created_at)}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notif.id);
                                }}
                                className="btn ghost sm"
                                style={{ padding: 4, color: 'var(--ink-3)' }}
                                title="Delete"
                              >
                                <Icon id="close" size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {read.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12, letterSpacing: '0.1em' }}>
                      Earlier
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {read.map(notif => (
                        <div
                          key={notif.id}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--line)',
                            cursor: 'pointer',
                            transition: 'all .15s',
                          }}
                          onClick={() => handleNotificationClick(notif)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        >
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 2 }}>
                                {notif.author_name || 'Unknown'} · {notif.project_name}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                                {notif.message}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                              <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                                {formatTime(notif.created_at)}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notif.id);
                                }}
                                className="btn ghost sm"
                                style={{ padding: 4, color: 'var(--ink-3)' }}
                                title="Delete"
                              >
                                <Icon id="close" size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <MobileTabBar role={me?.role} />
    </>
  );
}
