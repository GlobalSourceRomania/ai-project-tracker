'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const cardClass = 'bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 md:p-6 hover:bg-white/[0.05] transition-all cursor-pointer';
const btnBlue = 'px-4 py-2.5 bg-[#00B4EF]/10 border border-[#00B4EF]/40 text-[#00B4EF] rounded-xl text-sm font-medium hover:bg-[#00B4EF]/20 transition-colors';
const btnGreen = 'px-4 py-2.5 bg-[#8DC63F]/10 border border-[#8DC63F]/40 text-[#8DC63F] rounded-xl text-sm font-medium hover:bg-[#8DC63F]/20 transition-colors';
const btnRed = 'px-4 py-2.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors';
const selectClass = 'bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00B4EF]/70 text-sm';
const inputClass = 'w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4EF]/70 focus:bg-white/[0.09] transition-all text-sm';

type Project = { id: number; title: string; pipedrive_code: string; owner_id: number; owner_name: string; status: 'planning' | 'in_progress' | 'waiting' | 'completed'; created_at: string; updated_at: string };
type ProjectUpdate = { id: number; what_done: string; what_waiting: string; next_steps: string; created_at: string; author_name: string };
type User = { id: number; email: string; role: 'admin' | 'editor' | 'viewer' };

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', pipedriveCode: '', status: 'planning' });
  const [newUpdate, setNewUpdate] = useState({ whatDone: '', whatWaiting: '', nextSteps: '' });
  const [notification, setNotification] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          setProjects(await res.json());
          setUser({ id: 1, email: '', role: 'admin' });
        }
      } catch {
        console.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [router]);

  const fetchProjectUpdates = async (projectId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/updates`);
      if (res.ok) setUpdates(await res.json());
    } catch {
      console.error('Failed to fetch updates');
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setEditingStatus(false);
    setDeleteConfirm(false);
    fetchProjectUpdates(project.id);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const { project } = await res.json();
        setProjects([project, ...projects]);
        setNewProject({ title: '', pipedriveCode: '', status: 'planning' });
        setShowNewForm(false);
        setNotification('Project created!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error creating project');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdate),
      });
      if (res.ok) {
        const { update } = await res.json();
        setUpdates([update, ...updates]);
        setNewUpdate({ whatDone: '', whatWaiting: '', nextSteps: '' });
        setShowUpdateForm(false);
        setNotification('Update added!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error adding update');
    }
  };

  const handleStatusChange = async (newStatus: 'planning' | 'in_progress' | 'waiting' | 'completed') => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject({ ...selectedProject, status: newStatus });
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, status: newStatus } : p));
        setEditingStatus(false);
        setNotification('Status updated!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error updating status');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        setSelectedProject(null);
        setNotification('Project deleted!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch {
      setNotification('Error deleting project');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#080D1A]" />;

  const statusColors: Record<string, string> = {
    planning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    waiting: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    completed: 'bg-green-500/20 text-green-300 border-green-500/40',
  };

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.07] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-white/40 text-sm">Manage your AI projects</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role !== 'viewer' && <button onClick={() => setShowNewForm(true)} className={btnGreen}>+ New Project</button>}
            {user?.role === 'admin' && <button onClick={() => router.push('/admin/users')} className={btnBlue}>Users</button>}
            <button onClick={handleLogout} className="px-4 py-2.5 text-white/60 hover:text-white transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      {notification && <div className="fixed top-4 right-4 bg-[#8DC63F]/20 border border-[#8DC63F]/40 text-[#8DC63F] px-4 py-3 rounded-xl text-sm">{notification}</div>}

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {showNewForm && (
          <div className={`mb-6 ${cardClass}`}>
            <h3 className="text-lg font-semibold text-white mb-4">New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input type="text" placeholder="Project title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className={inputClass} required />
              <input type="text" placeholder="Pipedrive code (e.g., #260422z1)" value={newProject.pipedriveCode} onChange={(e) => setNewProject({ ...newProject, pipedriveCode: e.target.value })} className={inputClass} required />
              <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })} className={selectClass}>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className={btnGreen}>Create</button>
                <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className={`text-center py-12 ${cardClass}`}>
            <p className="text-white/40 mb-4">No projects yet</p>
            {user?.role !== 'viewer' && <button onClick={() => setShowNewForm(true)} className={btnGreen}>Create your first project</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} onClick={() => handleSelectProject(project)} className={cardClass}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1">{project.title}</h3>
                  <span className="text-[#00B4EF] font-mono text-sm">{project.pipedrive_code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-3 py-1 rounded-lg border ${statusColors[project.status]}`}>{project.status}</span>
                  <span className="text-white/40">{project.owner_name || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${cardClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
              <button onClick={() => setSelectedProject(null)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-white/40 text-sm">Pipedrive Code</p><p className="text-white font-mono">{selectedProject.pipedrive_code}</p></div>
                <div><p className="text-white/40 text-sm">Owner</p><p className="text-white">{selectedProject.owner_name || 'Unassigned'}</p></div>
                <div><p className="text-white/40 text-sm">Created</p><p className="text-white text-sm">{new Date(selectedProject.created_at).toLocaleDateString()}</p></div>
              </div>

              <div>
                <p className="text-white/40 text-sm mb-2">Status</p>
                {editingStatus ? (
                  <div className="flex gap-2">
                    <select value={selectedProject.status} onChange={(e) => handleStatusChange(e.target.value as any)} className={selectClass}>
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button onClick={() => setEditingStatus(false)} className="px-3 py-2 text-white/40 hover:text-white">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg border ${statusColors[selectedProject.status]}`}>{selectedProject.status}</span>
                    {user?.role !== 'viewer' && <button onClick={() => setEditingStatus(true)} className={btnBlue}>Change</button>}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/[0.07] pt-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>

              {user?.role !== 'viewer' && (
                <>
                  {!showUpdateForm ? (
                    <button onClick={() => setShowUpdateForm(true)} className={`${btnGreen} mb-4`}>+ Add Update</button>
                  ) : (
                    <form onSubmit={handleAddUpdate} className="space-y-3 mb-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                      <textarea placeholder="What was done?" value={newUpdate.whatDone} onChange={(e) => setNewUpdate({ ...newUpdate, whatDone: e.target.value })} className={inputClass} />
                      <textarea placeholder="What are we waiting for?" value={newUpdate.whatWaiting} onChange={(e) => setNewUpdate({ ...newUpdate, whatWaiting: e.target.value })} className={inputClass} />
                      <textarea placeholder="Next steps?" value={newUpdate.nextSteps} onChange={(e) => setNewUpdate({ ...newUpdate, nextSteps: e.target.value })} className={inputClass} />
                      <div className="flex gap-2">
                        <button type="submit" className={btnGreen}>Save</button>
                        <button type="button" onClick={() => setShowUpdateForm(false)} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors">Cancel</button>
                      </div>
                    </form>
                  )}
                </>
              )}

              <div className="space-y-3">
                {updates.length === 0 ? (
                  <p className="text-white/40 text-sm">No updates yet</p>
                ) : (
                  updates.map((update) => (
                    <div key={update.id} className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4">
                      <p className="text-white/40 text-xs mb-2">{new Date(update.created_at).toLocaleDateString()} • {update.author_name || 'Admin'}</p>
                      {update.what_done && <p className="text-white text-sm mb-2"><span className="text-[#8DC63F]">Done:</span> {update.what_done}</p>}
                      {update.what_waiting && <p className="text-white text-sm mb-2"><span className="text-yellow-400">Waiting:</span> {update.what_waiting}</p>}
                      {update.next_steps && <p className="text-white text-sm"><span className="text-[#00B4EF]">Next:</span> {update.next_steps}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {user?.role !== 'viewer' && (
              <div className="border-t border-white/[0.07] pt-4">
                {deleteConfirm ? (
                  <div className="flex gap-2">
                    <button onClick={handleDeleteProject} className={btnRed}>Confirm Delete</button>
                    <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-xl text-sm font-medium">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)} className={btnRed}>Delete Project</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
