'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const inputClass = 'w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4EF]/70 focus:bg-white/[0.09] transition-all text-sm';
const selectClass = 'w-full bg-[#111827] border border-white/[0.15] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00B4EF]/70 transition-all text-sm cursor-pointer';
const btnBlue = 'px-4 py-2.5 bg-[#00B4EF]/10 border border-[#00B4EF]/40 text-[#00B4EF] rounded-xl text-sm font-medium hover:bg-[#00B4EF]/20 transition-colors';
const btnGreen = 'px-4 py-2.5 bg-[#8DC63F]/10 border border-[#8DC63F]/40 text-[#8DC63F] rounded-xl text-sm font-medium hover:bg-[#8DC63F]/20 transition-colors';
const btnRed = 'px-4 py-2.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors';
const btnGray = 'px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors';

const statusColors: Record<string, string> = {
  planning: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  waiting: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  completed: 'bg-[#8DC63F]/20 text-[#8DC63F] border-[#8DC63F]/40',
};

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed',
};

type Status = 'planning' | 'in_progress' | 'waiting' | 'completed';
type Project = { id: number; title: string; pipedrive_code: string; owner_id: number; owner_name: string; status: Status; created_at: string; updated_at: string };
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
  const [newProject, setNewProject] = useState({ title: '', pipedriveCode: '', status: 'planning' as Status });
  const [newUpdate, setNewUpdate] = useState({ whatDone: '', whatWaiting: '', nextSteps: '' });
  const [notification, setNotification] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [deleteUpdateConfirm, setDeleteUpdateConfirm] = useState<number | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, projectsRes] = await Promise.all([fetch('/api/me'), fetch('/api/projects')]);
        if (meRes.status === 401 || projectsRes.status === 401) { router.push('/login'); return; }
        if (meRes.ok) setUser(await meRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const openModal = useCallback((project: Project) => {
    setSelectedProject(project);
    setEditingStatus(false);
    setPendingStatus(null);
    setDeleteConfirm(false);
    setShowUpdateForm(false);
    setEditingUpdate(null);
    setDeleteUpdateConfirm(null);
    document.body.classList.add('modal-open');
    fetch(`/api/projects/${project.id}/updates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setUpdates(data))
      .catch(() => setUpdates([]));
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    setEditingStatus(false);
    setPendingStatus(null);
    setDeleteConfirm(false);
    setShowUpdateForm(false);
    setEditingUpdate(null);
    setDeleteUpdateConfirm(null);
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

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
        notify('Project created!');
      }
    } catch { notify('Error creating project'); }
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
        notify('Update added!');
      }
    } catch { notify('Error adding update'); }
  };

  const handleSaveStatus = async () => {
    if (!selectedProject || !pendingStatus) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus }),
      });
      if (res.ok) {
        setSelectedProject({ ...selectedProject, status: pendingStatus });
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, status: pendingStatus } : p));
        setEditingStatus(false);
        setPendingStatus(null);
        notify('Status updated!');
      }
    } catch { notify('Error updating status'); }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editingUpdate) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/updates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateId: editingUpdate.id,
          whatDone: editingUpdate.what_done,
          whatWaiting: editingUpdate.what_waiting,
          nextSteps: editingUpdate.next_steps,
        }),
      });
      if (res.ok) {
        setUpdates(updates.map(u => u.id === editingUpdate.id ? editingUpdate : u));
        setEditingUpdate(null);
        notify('Update saved!');
      }
    } catch { notify('Error saving update'); }
  };

  const handleDeleteUpdate = async (updateId: number) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/updates`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId }),
      });
      if (res.ok) {
        setUpdates(updates.filter(u => u.id !== updateId));
        setDeleteUpdateConfirm(null);
        notify('Update deleted!');
      }
    } catch { notify('Error deleting update'); }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        closeModal();
        notify('Project deleted!');
      }
    } catch { notify('Error deleting project'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#080D1A]" />;

  return (
    <div className="min-h-screen bg-[#080D1A]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#080D1A]/80 border-b border-white/[0.07] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Projects</h1>
            <p className="text-white/40 text-sm hidden md:block">Manage your AI projects</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {user?.role !== 'viewer' && (
              <button onClick={() => setShowNewForm(v => !v)} className={btnGreen}>+ New</button>
            )}
            {user?.role === 'admin' && (
              <button onClick={() => router.push('/admin/users')} className={btnBlue}>Users</button>
            )}
            <button onClick={handleLogout} className="px-3 py-2.5 text-white/50 hover:text-white transition-colors text-sm">Sign out</button>
          </div>
        </div>
      </header>

      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-[#8DC63F]/20 border border-[#8DC63F]/40 text-[#8DC63F] px-4 py-3 rounded-xl text-sm shadow-lg">
          {notification}
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* New project form */}
        {showNewForm && (
          <div className="mb-6 bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Project title</label>
                <input type="text" placeholder="e.g. Sistem Inspectie Automata" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className={inputClass} required />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Pipedrive code</label>
                <input type="text" placeholder="e.g. #260422z1" value={newProject.pipedriveCode} onChange={(e) => setNewProject({ ...newProject, pipedriveCode: e.target.value })} className={inputClass} required />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Status</label>
                <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Status })} className={selectClass}>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className={btnGreen}>Create</button>
                <button type="button" onClick={() => setShowNewForm(false)} className={btnGray}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Cards grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.07]">
            <p className="text-white/40 mb-4 text-lg">No projects yet</p>
            {user?.role !== 'viewer' && (
              <button onClick={() => setShowNewForm(true)} className={btnGreen}>Create your first project</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => openModal(project)}
                className="text-left w-full bg-white/[0.03] rounded-2xl border border-white/[0.07] p-5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all focus:outline-none focus:ring-2 focus:ring-[#00B4EF]/40"
              >
                <div className="flex items-start justify-between mb-4 gap-2">
                  <h3 className="text-base font-semibold text-white leading-tight flex-1">{project.title}</h3>
                  <span className="text-[#00B4EF] font-mono text-xs bg-[#00B4EF]/10 px-2 py-1 rounded-lg border border-[#00B4EF]/20 shrink-0">
                    {project.pipedrive_code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                  <span className="text-white/40 text-xs">{project.owner_name || 'Unassigned'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0D1422] rounded-2xl border border-white/[0.1] shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-[#0D1422] border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg font-bold text-white truncate">{selectedProject.title}</h2>
                <p className="text-[#00B4EF] font-mono text-sm">{selectedProject.pipedrive_code}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shrink-0">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-white/40 text-xs mb-1">Owner</p>
                  <p className="text-white text-sm font-medium">{selectedProject.owner_name || 'Unassigned'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-white/40 text-xs mb-1">Created</p>
                  <p className="text-white text-sm font-medium">{new Date(selectedProject.created_at).toLocaleDateString('ro-RO')}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <p className="text-white/40 text-xs mb-3">Status</p>
                {editingStatus ? (
                  <div className="space-y-3">
                    <select
                      value={pendingStatus ?? selectedProject.status}
                      onChange={(e) => setPendingStatus(e.target.value as Status)}
                      className={selectClass}
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleSaveStatus} className={btnGreen}>Save</button>
                      <button onClick={() => { setEditingStatus(false); setPendingStatus(null); }} className={btnGray}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${statusColors[selectedProject.status]}`}>
                      {statusLabels[selectedProject.status]}
                    </span>
                    {user?.role !== 'viewer' && (
                      <button onClick={() => { setEditingStatus(true); setPendingStatus(selectedProject.status); }} className={btnBlue}>Change</button>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Timeline</h3>
                  {user?.role !== 'viewer' && !showUpdateForm && (
                    <button onClick={() => setShowUpdateForm(true)} className={btnGreen}>+ Add Update</button>
                  )}
                </div>

                {showUpdateForm && (
                  <form onSubmit={handleAddUpdate} className="mb-4 space-y-3 bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Ce s-a făcut?</label>
                      <textarea placeholder="Activități finalizate..." value={newUpdate.whatDone} onChange={(e) => setNewUpdate({ ...newUpdate, whatDone: e.target.value })} className={inputClass} rows={2} />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Ce așteptăm de la client?</label>
                      <textarea placeholder="Informații, acces, materiale..." value={newUpdate.whatWaiting} onChange={(e) => setNewUpdate({ ...newUpdate, whatWaiting: e.target.value })} className={inputClass} rows={2} />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Next steps</label>
                      <textarea placeholder="Ce urmează..." value={newUpdate.nextSteps} onChange={(e) => setNewUpdate({ ...newUpdate, nextSteps: e.target.value })} className={inputClass} rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className={btnGreen}>Save</button>
                      <button type="button" onClick={() => setShowUpdateForm(false)} className={btnGray}>Cancel</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {updates.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-6">No updates yet</p>
                  ) : (
                    updates.map((update) => (
                      <div key={update.id} className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4">
                        {editingUpdate?.id === update.id ? (
                          <form onSubmit={handleSaveUpdate} className="space-y-3">
                            <div>
                              <label className="text-white/50 text-xs mb-1 block">Ce s-a făcut?</label>
                              <textarea value={editingUpdate.what_done || ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, what_done: e.target.value })} className={inputClass} rows={2} />
                            </div>
                            <div>
                              <label className="text-white/50 text-xs mb-1 block">Ce așteptăm?</label>
                              <textarea value={editingUpdate.what_waiting || ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, what_waiting: e.target.value })} className={inputClass} rows={2} />
                            </div>
                            <div>
                              <label className="text-white/50 text-xs mb-1 block">Next steps</label>
                              <textarea value={editingUpdate.next_steps || ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, next_steps: e.target.value })} className={inputClass} rows={2} />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className={btnGreen}>Save</button>
                              <button type="button" onClick={() => setEditingUpdate(null)} className={btnGray}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-white/40 text-xs">{new Date(update.created_at).toLocaleDateString('ro-RO')} · {update.author_name || 'Admin'}</p>
                              {user?.role !== 'viewer' && (
                                <div className="flex gap-1 ml-2 shrink-0">
                                  {deleteUpdateConfirm === update.id ? (
                                    <>
                                      <button onClick={() => handleDeleteUpdate(update.id)} className="px-2 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors">Confirm</button>
                                      <button onClick={() => setDeleteUpdateConfirm(null)} className="px-2 py-1 text-white/40 hover:text-white text-xs transition-colors">Cancel</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => setEditingUpdate(update)} className="px-2 py-1 bg-[#00B4EF]/10 border border-[#00B4EF]/30 text-[#00B4EF] rounded-lg text-xs hover:bg-[#00B4EF]/20 transition-colors">Edit</button>
                                      <button onClick={() => setDeleteUpdateConfirm(update.id)} className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">Del</button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              {update.what_done && (
                                <div className="flex gap-2">
                                  <span className="text-[#8DC63F] text-xs font-semibold shrink-0 w-10">Done</span>
                                  <p className="text-white/80 text-sm">{update.what_done}</p>
                                </div>
                              )}
                              {update.what_waiting && (
                                <div className="flex gap-2">
                                  <span className="text-yellow-400 text-xs font-semibold shrink-0 w-10">Wait</span>
                                  <p className="text-white/80 text-sm">{update.what_waiting}</p>
                                </div>
                              )}
                              {update.next_steps && (
                                <div className="flex gap-2">
                                  <span className="text-[#00B4EF] text-xs font-semibold shrink-0 w-10">Next</span>
                                  <p className="text-white/80 text-sm">{update.next_steps}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Delete project */}
              {user?.role !== 'viewer' && (
                <div className="border-t border-white/[0.07] pt-4">
                  {deleteConfirm ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 text-sm mb-3">Ești sigur că vrei să ștergi acest proiect? Acțiunea nu poate fi anulată.</p>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteProject} className={btnRed}>Da, șterge</button>
                        <button onClick={() => setDeleteConfirm(false)} className={btnGray}>Anulează</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(true)} className={btnRed}>Delete Project</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
