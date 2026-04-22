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
  bottleneck: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed',
  bottleneck: 'Bottleneck',
};

type Status = 'planning' | 'in_progress' | 'waiting' | 'completed' | 'bottleneck';
type Project = {
  id: number; title: string; pipedrive_code: string; owner_id: number; owner_name: string;
  status: Status; description: string | null; bottleneck: string | null;
  created_at: string; updated_at: string;
};
type ProjectUpdate = { id: number; what_done: string; what_waiting: string; next_steps: string; created_at: string; author_name: string };
type Task = { id: number; project_id: number; title: string; is_done: boolean; created_at: string };
type User = { id: number; email: string; role: 'admin' | 'editor' | 'viewer' };

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState('');

  // New project form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', pipedriveCode: '', status: 'planning' as Status, description: '', bottleneck: '' });

  // Status editing
  const [editingStatus, setEditingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

  // Description editing
  const [editingDescription, setEditingDescription] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');

  // Bottleneck editing
  const [editingBottleneck, setEditingBottleneck] = useState(false);
  const [pendingBottleneck, setPendingBottleneck] = useState('');

  // Updates
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ whatDone: '', whatWaiting: '', nextSteps: '' });
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [deleteUpdateConfirm, setDeleteUpdateConfirm] = useState<number | null>(null);

  // Tasks
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Delete project
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
    setEditingDescription(false);
    setPendingDescription('');
    setEditingBottleneck(false);
    setPendingBottleneck('');
    setDeleteConfirm(false);
    setShowUpdateForm(false);
    setEditingUpdate(null);
    setDeleteUpdateConfirm(null);
    setNewTaskTitle('');
    document.body.classList.add('modal-open');

    Promise.all([
      fetch(`/api/projects/${project.id}/updates`).then(r => r.ok ? r.json() : []),
      fetch(`/api/projects/${project.id}/tasks`).then(r => r.ok ? r.json() : []),
    ]).then(([upd, tsk]) => {
      setUpdates(upd);
      setTasks(tsk);
    }).catch(() => { setUpdates([]); setTasks([]); });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    setEditingStatus(false);
    setPendingStatus(null);
    setEditingDescription(false);
    setEditingBottleneck(false);
    setDeleteConfirm(false);
    setShowUpdateForm(false);
    setEditingUpdate(null);
    setDeleteUpdateConfirm(null);
    setNewTaskTitle('');
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
        setNewProject({ title: '', pipedriveCode: '', status: 'planning', description: '', bottleneck: '' });
        setShowNewForm(false);
        notify('Project created!');
      }
    } catch { notify('Error creating project'); }
  };

  const putProject = async (patch: Partial<{ title: string; status: string; description: string | null; bottleneck: string | null }>) => {
    if (!selectedProject) return null;
    const res = await fetch(`/api/projects/${selectedProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selectedProject.title,
        status: selectedProject.status,
        description: selectedProject.description,
        bottleneck: selectedProject.bottleneck,
        ...patch,
      }),
    });
    return res.ok ? res : null;
  };

  const handleSaveStatus = async () => {
    if (!selectedProject || !pendingStatus) return;
    const res = await putProject({ status: pendingStatus });
    if (res) {
      const updated = { ...selectedProject, status: pendingStatus };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, status: pendingStatus } : p));
      setEditingStatus(false);
      setPendingStatus(null);
      notify('Status updated!');
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedProject) return;
    const val = pendingDescription.trim() || null;
    const res = await putProject({ description: val });
    if (res) {
      const updated = { ...selectedProject, description: val };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, description: val } : p));
      setEditingDescription(false);
      notify('Description saved!');
    }
  };

  const handleSaveBottleneck = async () => {
    if (!selectedProject) return;
    const val = pendingBottleneck.trim() || null;
    const newStatus = val ? 'bottleneck' : selectedProject.status;
    const res = await putProject({ bottleneck: val, status: newStatus });
    if (res) {
      const updated = { ...selectedProject, bottleneck: val, status: newStatus as Status };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, bottleneck: val, status: newStatus as Status } : p));
      setEditingBottleneck(false);
      notify(val ? 'Bottleneck salvat — status setat pe Bottleneck!' : 'Bottleneck cleared!');
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
        notify('Update added!');
      }
    } catch { notify('Error adding update'); }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editingUpdate) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/updates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId: editingUpdate.id, whatDone: editingUpdate.what_done, whatWaiting: editingUpdate.what_waiting, nextSteps: editingUpdate.next_steps }),
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
      if (res.ok) { setUpdates(updates.filter(u => u.id !== updateId)); setDeleteUpdateConfirm(null); notify('Update deleted!'); }
    } catch { notify('Error deleting update'); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks([...tasks, task]);
        setNewTaskTitle('');
        notify('Task added!');
      }
    } catch { notify('Error adding task'); }
  };

  const handleToggleTask = async (taskId: number, isDone: boolean) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, isDone }),
      });
      if (res.ok) setTasks(tasks.map(t => t.id === taskId ? { ...t, is_done: isDone } : t));
    } catch { notify('Error updating task'); }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (res.ok) { setTasks(tasks.filter(t => t.id !== taskId)); notify('Task deleted!'); }
    } catch { notify('Error deleting task'); }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, { method: 'DELETE' });
      if (res.ok) { setProjects(projects.filter(p => p.id !== selectedProject.id)); closeModal(); notify('Project deleted!'); }
    } catch { notify('Error deleting project'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    router.push('/login');
  };

  const doneTasks = tasks.filter(t => t.is_done).length;

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
                  <option value="bottleneck">Bottleneck</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Descriere (opțional)</label>
                <textarea placeholder="Descriere generală a proiectului..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className={inputClass} rows={2} />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Bottleneck (opțional)</label>
                <textarea placeholder="Punct de blocare curent..." value={newProject.bottleneck} onChange={(e) => setNewProject({ ...newProject, bottleneck: e.target.value })} className={inputClass} rows={2} />
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
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="text-base font-semibold text-white leading-tight flex-1">{project.title}</h3>
                  <span className="text-[#00B4EF] font-mono text-xs bg-[#00B4EF]/10 px-2 py-1 rounded-lg border border-[#00B4EF]/20 shrink-0">
                    {project.pipedrive_code}
                  </span>
                </div>
                {project.description && (
                  <p className="text-white/40 text-xs mb-3 line-clamp-2">{project.description}</p>
                )}
                {project.bottleneck && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-orange-400 text-xs">⚠</span>
                    <p className="text-orange-300/70 text-xs line-clamp-1">{project.bottleneck}</p>
                  </div>
                )}
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
                    <select value={pendingStatus ?? selectedProject.status} onChange={(e) => setPendingStatus(e.target.value as Status)} className={selectClass}>
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="completed">Completed</option>
                      <option value="bottleneck">Bottleneck</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleSaveStatus} className={btnGreen}>Save</button>
                      <button onClick={() => { setEditingStatus(false); setPendingStatus(null); }} className={btnGray}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2.5 rounded-xl border text-sm font-medium ${statusColors[selectedProject.status]}`}>
                      {statusLabels[selectedProject.status]}
                    </span>
                    {user?.role !== 'viewer' && (
                      <button onClick={() => { setEditingStatus(true); setPendingStatus(selectedProject.status); }} className={btnBlue}>Change</button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-xs">Descriere</p>
                  {user?.role !== 'viewer' && !editingDescription && (
                    <button onClick={() => { setEditingDescription(true); setPendingDescription(selectedProject.description || ''); }} className="text-[#00B4EF] text-xs hover:text-[#00B4EF]/80 transition-colors">Edit</button>
                  )}
                </div>
                {editingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={pendingDescription}
                      onChange={(e) => setPendingDescription(e.target.value)}
                      placeholder="Descriere generală a proiectului..."
                      className={inputClass}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveDescription} className={btnGreen}>Save</button>
                      <button onClick={() => setEditingDescription(false)} className={btnGray}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className={selectedProject.description ? 'text-white/80 text-sm leading-relaxed' : 'text-white/25 text-sm italic'}>
                    {selectedProject.description || 'Nicio descriere adăugată'}
                  </p>
                )}
              </div>

              {/* Bottleneck */}
              <div className="bg-orange-500/[0.06] rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-sm">⚠</span>
                    <p className="text-orange-300/70 text-xs">Bottleneck</p>
                  </div>
                  {user?.role !== 'viewer' && !editingBottleneck && (
                    <button onClick={() => { setEditingBottleneck(true); setPendingBottleneck(selectedProject.bottleneck || ''); }} className="text-orange-400 text-xs hover:text-orange-300 transition-colors">Edit</button>
                  )}
                </div>
                {editingBottleneck ? (
                  <div className="space-y-3">
                    <textarea
                      value={pendingBottleneck}
                      onChange={(e) => setPendingBottleneck(e.target.value)}
                      placeholder="Punct de blocare curent..."
                      className={inputClass}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveBottleneck} className={btnGreen}>Save</button>
                      <button onClick={() => setEditingBottleneck(false)} className={btnGray}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className={selectedProject.bottleneck ? 'text-orange-200/80 text-sm leading-relaxed' : 'text-white/25 text-sm italic'}>
                    {selectedProject.bottleneck || 'Niciun bottleneck identificat'}
                  </p>
                )}
              </div>

              {/* Tasks */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">Pași / Tasks</p>
                    {tasks.length > 0 && (
                      <span className="text-white/40 text-xs">{doneTasks}/{tasks.length} completate</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {tasks.length > 0 && (
                  <div className="h-1.5 bg-white/[0.06] rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-[#8DC63F] rounded-full transition-all duration-300"
                      style={{ width: `${(doneTasks / tasks.length) * 100}%` }}
                    />
                  </div>
                )}

                {/* Task list */}
                <div className="space-y-2 mb-4">
                  {tasks.length === 0 && (
                    <p className="text-white/25 text-sm italic">Niciun pas adăugat</p>
                  )}
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 group">
                      {user?.role !== 'viewer' ? (
                        <button
                          onClick={() => handleToggleTask(task.id, !task.is_done)}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            task.is_done
                              ? 'bg-[#8DC63F] border-[#8DC63F] text-white'
                              : 'border-white/30 hover:border-[#8DC63F]/60'
                          }`}
                        >
                          {task.is_done && <span className="text-xs leading-none">✓</span>}
                        </button>
                      ) : (
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          task.is_done ? 'bg-[#8DC63F] border-[#8DC63F] text-white' : 'border-white/20'
                        }`}>
                          {task.is_done && <span className="text-xs leading-none">✓</span>}
                        </div>
                      )}
                      <span className={`flex-1 text-sm ${task.is_done ? 'line-through text-white/30' : 'text-white/80'}`}>
                        {task.title}
                      </span>
                      {user?.role !== 'viewer' && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs transition-all px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add task form */}
                {user?.role !== 'viewer' && (
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adaugă un pas nou..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    <button type="submit" className={btnGreen}>+ Add</button>
                  </form>
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
