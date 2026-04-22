'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const cardClass = 'bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 md:p-6';
const inputClass = 'w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4EF]/70 focus:bg-white/[0.09] transition-all text-sm';
const btnBlue = 'px-4 py-2.5 bg-[#00B4EF]/10 border border-[#00B4EF]/40 text-[#00B4EF] rounded-xl text-sm font-medium hover:bg-[#00B4EF]/20 transition-colors';
const btnGreen = 'px-4 py-2.5 bg-[#8DC63F]/10 border border-[#8DC63F]/40 text-[#8DC63F] rounded-xl text-sm font-medium hover:bg-[#8DC63F]/20 transition-colors';
const btnRed = 'px-4 py-2.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors';

type User = { id: number; email: string; display_name: string; role: 'admin' | 'editor' | 'viewer'; created_at: string };

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [newUser, setNewUser] = useState({ email: '', password: '', displayName: '', role: 'viewer' as const });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
        setNotification('User created successfully!');
        setTimeout(() => setNotification(''), 3000);
      } else {
        const error = await res.json();
        setNotification(error.error || 'Failed to create user');
      }
    } catch {
      setNotification('Error creating user');
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
        setNotification('User deleted successfully!');
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
            <p className="text-white/40 text-sm">Manage admin and user accounts</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Role</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Created</th>
                  <th className="text-right py-3 px-3 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white">{user.email}</td>
                    <td className="py-3 px-3 text-white">{user.display_name}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${user.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/40' : user.role === 'editor' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-white/[0.1] text-white/60 border-white/[0.2]'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white/60">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      {deleteConfirm === user.id ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleDeleteUser(user.id)} className={btnRed}>Confirm delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-white/40 hover:text-white text-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(user.id)} className={btnRed}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="text-white/40 text-center py-6">No users yet</p>}
        </div>
      </main>
    </div>
  );
}
