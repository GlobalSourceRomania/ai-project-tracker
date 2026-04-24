'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Icon from '@/components/Icon';

type Role = 'admin' | 'editor' | 'viewer';
type User = {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  created_at: string;
};
type Me = { id: number; email: string; display_name?: string; role: Role };

function initials(u: User) {
  const n = (u.display_name && u.display_name.trim()) || u.email;
  return (n[0] ?? '·').toUpperCase();
}

function formatRelative(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [newUser, setNewUser] = useState({ email: '', password: '', displayName: '', role: 'viewer' as Role });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<{ userId: number; role: Role } | null>(null);
  const [filter, setFilter] = useState<Role | 'all'>('all');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meRes, usersRes] = await Promise.all([fetch('/api/me'), fetch('/api/users')]);
        if (meRes.status === 401) { router.push('/login'); return; }
        if (usersRes.status === 403) { router.push('/projects'); return; }
        if (meRes.ok) setMe(await meRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch {
        console.error('Failed to fetch users');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const { user } = await res.json();
        setUsers([...users, user]);
        setNewUser({ email: '', password: '', displayName: '', role: 'viewer' });
        setShowForm(false);
        notify('User created!');
      } else {
        const data = await res.json().catch(() => ({}));
        notify(data.error || 'Failed');
      }
    } catch { notify('Error creating user'); }
  };

  const handleUpdateRole = async (userId: number, role: Role) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
        setEditingRole(null);
        notify('Role updated!');
      }
    } catch { notify('Error updating role'); }
  };

  const handleDelete = async (userId: number) => {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setDeleteConfirm(null);
        notify('User deleted!');
      }
    } catch { notify('Error deleting user'); }
  };

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
    viewers: users.filter(u => u.role === 'viewer').length,
  }), [users]);

  const filtered = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter(u => u.role === filter);
  }, [users, filter]);

  if (loading) return <div style={{ minHeight: '100vh' }} />;

  return (
    <>
      <div className="app">
        <Sidebar
          user={me}
          userCount={users.length}
          onLogout={handleLogout}
        />

        <main className="main">
          <div className="topbar">
            <div style={{ minWidth: 0 }}>
              <h1>User management</h1>
              <div className="crumb">admin / users · {users.length} accounts</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'admin', 'editor', 'viewer'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className="btn sm"
                  title={r}
                  style={filter === r ? { background: 'var(--grad-soft)', borderColor: 'rgba(141,209,58,0.3)', color: 'var(--ink)' } : {}}
                >
                  <span style={{ display: 'none' }} className="sm-hide">{r}</span>
                  <span style={{ display: 'block' }} className="sm-show">{r[0]?.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <button
              className="btn primary"
              onClick={() => setShowForm(v => !v)}
              title="Invite user"
            >
              <Icon id="plus" />
              <span style={{ display: 'none' }} className="sm-hide">Invite user</span>
            </button>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="l">Total</div>
              <div className="n">{stats.total}</div>
              <div className="spark" />
            </div>
            <div className="stat">
              <div className="l">Admins</div>
              <div className="n" style={{ color: 'var(--role-admin)' }}>{stats.admins}</div>
              <div className="spark" />
            </div>
            <div className="stat">
              <div className="l">Editors</div>
              <div className="n" style={{ color: 'var(--role-editor)' }}>{stats.editors}</div>
              <div className="spark" />
            </div>
            <div className="stat">
              <div className="l">Viewers</div>
              <div className="n" style={{ color: 'var(--role-viewer)' }}>{stats.viewers}</div>
              <div className="spark" />
            </div>
          </div>

          {showForm && (
            <div className="form-container">
              <div className="card form-card">
                <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Invite user</div>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" placeholder="you@globalsource.ro" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">Display name</label>
                    <input type="text" placeholder="Name shown in UI" value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })} className="input">
                      <option value="viewer">Viewer (read-only)</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn primary"><Icon id="plus" />Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container">
            <div className="utable">
              <div className="utable-head">
                <div>#</div>
                <div>User</div>
                <div>Role</div>
                <div>Last seen</div>
                <div style={{ textAlign: 'right' }} />
              </div>

              {filtered.length === 0 ? (
                <div className="utable-row" style={{ gridTemplateColumns: '1fr' }}>
                  <div style={{ color: 'var(--ink-3)', textAlign: 'center', padding: 12 }}>No users match this filter.</div>
                </div>
              ) : filtered.map((u, idx) => (
                <div key={u.id} className="utable-row">
                  <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div className="u-avatar">{initials(u)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="u-name">{u.display_name || u.email.split('@')[0]}</div>
                      <div className="u-email">{u.email}</div>
                    </div>
                  </div>

                  <div>
                    {editingRole?.userId === u.id ? (
                      <select
                        className="input"
                        style={{ padding: '6px 8px', fontSize: 12 }}
                        value={editingRole.role}
                        onChange={(e) => setEditingRole({ userId: u.id, role: e.target.value as Role })}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`chip role-${u.role}`}>{u.role}</span>
                    )}
                  </div>

                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {formatRelative(u.created_at)}
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {editingRole?.userId === u.id ? (
                      <>
                        <button className="btn sm primary" onClick={() => handleUpdateRole(u.id, editingRole.role)}>Save</button>
                        <button className="btn sm" onClick={() => setEditingRole(null)}>Cancel</button>
                      </>
                    ) : deleteConfirm === u.id ? (
                      <>
                        <button className="btn sm danger" onClick={() => handleDelete(u.id)}>Confirm</button>
                        <button className="btn sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn sm"
                          onClick={() => setEditingRole({ userId: u.id, role: u.role })}
                          aria-label="Edit role"
                        >
                          <Icon id="edit" />
                        </button>
                        <button
                          className="btn sm danger"
                          onClick={() => setDeleteConfirm(u.id)}
                          aria-label="Delete user"
                        >
                          <Icon id="trash" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileTabBar role={me?.role} />

      {notification && (
        <div
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 100,
            background: 'rgba(141,209,58,0.15)',
            border: '1px solid rgba(141,209,58,0.4)',
            color: 'var(--gs-green)',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {notification}
        </div>
      )}
    </>
  );
}
