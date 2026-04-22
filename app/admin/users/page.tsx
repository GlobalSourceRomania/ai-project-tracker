'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const cardClass = 'bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 md:p-6';
const inputClass = 'w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4EF]/70 focus:bg-white/[0.09] transition-all text-sm';
const selectClass = 'bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00B4EF]/70 text-sm';
const btnBlue = 'px-3 py-2 bg-[#00B4EF]/10 border border-[#00B4EF]/40 text-[#00B4EF] rounded-xl text-xs font-medium hover:bg-[#00B4EF]/20 transition-colors';
const btnGreen = 'px-4 py-2.5 bg-[#8DC63F]/10 border border-[#8DC63F]/40 text-[#8DC63F] rounded-xl text-sm font-medium hover:bg-[#8DC63F]/20 transition-colors';
const btnRed = 'px-3 py-2 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors';

type User = { id: number; email: string; display_name: string; role: 'admin' | 'editor' | 'viewer'; created_at: string };

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [newUser, setNewUser] = useState({ email: '', password: '', displayName: '', role: 'viewer' as const });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<{ userId: number; role: 'admin' | 'editor' | 'viewer' } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.status === 403) {
          router.push('/projects');
          return;
        }
        if (res.ok) setUsers(await res.json());
      } catch {
        console.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  const handleCreateUser = async (e: React.FormEvent) => {
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
        setNotification('User created!');
        setTimeout(() => setNotification(''), 3000);
      } else {
        const error = await res.json();
        setNotification(error.error || 'Failed');
      }
    } catch {
      setNotification('Error creating user');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setEditingRole(null);
        setNotification('Role updated!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error updating role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        setDeleteConfirm(null);
        setNotification('User deleted!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error deleting user');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#080D1A]" />;

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.07] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-white/40 text-sm">Manage accounts & roles</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className={btnGreen}>+ New User</button>
            <button onClick={() => router.push('/projects')} className={btnBlue}>Back</button>
          </div>
        </div>
      </header>

      {notification && <div className="fixed top-4 right-4 bg-[#8DC63F]/20 border border-[#8DC63F]/40 text-[#8DC63F] px-4 py-3 rounded-xl text-sm">{notification}</div>}

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {showForm && (
          <div className={`mb-6 ${cardClass}`}>
            <h3 className="text-lg font-semibold text-white mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={inputClass} required />
              <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={inputClass} required />
              <input type="text" placeholder="Display name" value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} className={inputClass} required />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })} className={inputClass}>
                <option value="viewer">Viewer (read-only)</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className={btnGreen}>Create User</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-white mb-4">Users ({users.length})</h3>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-white/40 text-center py-6">No users yet</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-white/[0.02] rounded-xl border border-white/[0.05] p-4">
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-white/50 text-sm">{user.display_name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingRole?.userId === user.id ? (
                      <select value={editingRole.role} onChange={(e) => setEditingRole({ userId: user.id, role: e.target.value as any })} className={selectClass}>
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${user.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/40' : user.role === 'editor' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-white/[0.1] text-white/60 border-white/[0.2]'}`}>
                        {user.role}
                      </span>
                    )}

                    {editingRole?.userId === user.id ? (
                      <>
                        <button onClick={() => handleUpdateRole(user.id, editingRole.role)} className={btnGreen}>Save</button>
                        <button onClick={() => setEditingRole(null)} className="px-3 py-2 text-white/40 hover:text-white text-xs">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditingRole({ userId: user.id, role: user.role })} className={btnBlue}>Change</button>
                    )}

                    {deleteConfirm === user.id ? (
                      <>
                        <button onClick={() => handleDeleteUser(user.id)} className={btnRed}>Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 text-white/40 hover:text-white text-xs">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(user.id)} className={btnRed}>Delete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
