'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { registerServiceWorker, setupNotificationListener, type PushNotificationPayload } from '@/lib/service-worker-register';
import { extractMentions, createMentionNotification } from '@/lib/mentions';
import NotificationPrompt from '@/components/NotificationPrompt';
import MentionInput from '@/components/MentionInput';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Icon from '@/components/Icon';

type Status = 'planning' | 'demo' | 'in_progress' | 'bottleneck' | 'completed';

type Project = {
  id: number;
  title: string;
  pipedrive_code: string;
  owner_id: number;
  owner_name: string | null;
  status: Status;
  description: string | null;
  bottleneck: string | null;
  tasks_total?: number;
  tasks_done?: number;
  created_at: string;
  updated_at: string;
};

type ProjectUpdate = {
  id: number;
  what_done: string | null;
  what_waiting: string | null;
  next_steps: string | null;
  created_at: string;
  author_name: string | null;
};

type Task = { id: number; project_id: number; title: string; is_done: boolean; created_at: string };
type User = { id: number; email: string; display_name?: string; role: 'admin' | 'editor' | 'viewer' };

const STATUS_LABEL: Record<Status, string> = {
  planning: 'Planning',
  demo: 'Demo',
  in_progress: 'In Progress',
  bottleneck: 'Bottleneck',
  completed: 'Completed',
};

const KANBAN_COLUMNS: Status[] = ['planning', 'demo', 'in_progress', 'bottleneck', 'completed'];

// Statuses that require a pipedrive code
const STATUSES_REQUIRING_CODE = ['in_progress', 'bottleneck', 'completed'];
const STATUSES_WITHOUT_CODE = ['planning', 'demo'];

function cardStatusClass(s: Status) {
  if (s === 'in_progress') return 'st-progress';
  if (s === 'completed') return 'st-done';
  return `st-${s}`;
}

function progressOf(p: Project) {
  if (p.tasks_total && p.tasks_total > 0) {
    return Math.round(((p.tasks_done ?? 0) / p.tasks_total) * 100);
  }
  // fallback by status
  if (p.status === 'completed') return 100;
  if (p.status === 'in_progress') return 50;
  if (p.status === 'bottleneck') return 25;
  if (p.status === 'demo') return 30;
  if (p.status === 'planning') return 10;
  return 0;
}

function formatDateRo(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function relativeTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'acum';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateRo(iso);
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState('');
  const [search, setSearch] = useState('');

  // New project form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', pipedriveCode: '', status: 'planning' as Status, description: '', bottleneck: '' });

  // Status / description / bottleneck editing
  const [editingStatus, setEditingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [pendingPipedriveCode, setPendingPipedriveCode] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');
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

  const canEdit = user?.role !== 'viewer';

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, projectsRes, usersRes] = await Promise.all([
          fetch('/api/me'),
          fetch('/api/projects'),
          fetch('/api/users/list'),
        ]);
        if (meRes.status === 401 || projectsRes.status === 401) { router.push('/login'); return; }
        if (meRes.ok) setUser(await meRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    registerServiceWorker();
    setupNotificationListener((payload: PushNotificationPayload) => {
      notify(`${payload.changedBy} ${payload.action} "${payload.projectName}"`);
      fetch('/api/projects')
        .then(r => r.ok ? r.json() : [])
        .then((updatedProjects: Project[]) => setProjects(updatedProjects))
        .catch(() => {});
    });
  }, []);

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
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  // ---------- stats ----------
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'in_progress').length;
    const blocked = projects.filter(p => p.status === 'bottleneck').length;
    const waiting = projects.filter(p => p.status === 'waiting').length;
    const done = projects.filter(p => p.status === 'completed').length;
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, active, blocked, waiting, done, completion };
  }, [projects]);

  // ---------- filtered projects (by search) ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.pipedrive_code.toLowerCase().includes(q) ||
      (p.owner_name ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q),
    );
  }, [projects, search]);

  // ---------- create/update project ----------
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

    // Validate pipedrive code requirement
    if (STATUSES_REQUIRING_CODE.includes(pendingStatus) && !pendingPipedriveCode?.trim()) {
      notify(`Pipedrive code is required for status "${pendingStatus}"`);
      return;
    }

    const updateData: any = { status: pendingStatus };
    if (pendingPipedriveCode !== null) {
      updateData.pipedriveCode = pendingPipedriveCode.trim();
    }

    const res = await putProject(updateData);
    if (res) {
      const updated = {
        ...selectedProject,
        status: pendingStatus,
        pipedrive_code: pendingPipedriveCode || selectedProject.pipedrive_code,
      };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? updated : p));
      setEditingStatus(false);
      setPendingStatus(null);
      setPendingPipedriveCode(null);
      notify('Status updated!');
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedProject || !user) return;
    const val = pendingDescription.trim() || null;
    const res = await putProject({ description: val });
    if (res) {
      const updated = { ...selectedProject, description: val };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, description: val } : p));
      setEditingDescription(false);

      // Detect and notify mentions
      if (val) {
        const mentions = extractMentions(val);
        for (const email of mentions) {
          await createMentionNotification(email, user.id, selectedProject.id, selectedProject.title, 'description', val.substring(0, 100));
        }
      }

      notify('Description saved!');
    }
  };

  const handleSaveBottleneck = async () => {
    if (!selectedProject || !user) return;
    const val = pendingBottleneck.trim() || null;
    const newStatus: Status = val ? 'bottleneck' : selectedProject.status;
    const res = await putProject({ bottleneck: val, status: newStatus });
    if (res) {
      const updated = { ...selectedProject, bottleneck: val, status: newStatus };
      setSelectedProject(updated);
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, bottleneck: val, status: newStatus } : p));
      setEditingBottleneck(false);

      // Detect and notify mentions
      if (val) {
        const mentions = extractMentions(val);
        for (const email of mentions) {
          await createMentionNotification(email, user.id, selectedProject.id, selectedProject.title, 'bottleneck', val.substring(0, 100));
        }
      }

      notify(val ? 'Bottleneck saved — status set to Bottleneck' : 'Bottleneck cleared!');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !user) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdate),
      });
      if (res.ok) {
        const { update } = await res.json();
        setUpdates([update, ...updates]);

        // Detect mentions in all update fields
        const allText = `${newUpdate.whatDone} ${newUpdate.whatWaiting} ${newUpdate.nextSteps}`;
        const mentions = extractMentions(allText);
        for (const email of mentions) {
          await createMentionNotification(email, user.id, selectedProject.id, selectedProject.title, 'update', allText.substring(0, 100));
        }

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
      if (res.ok) { setUpdates(updates.filter(u => u.id !== updateId)); setDeleteUpdateConfirm(null); notify('Update deleted!'); }
    } catch { notify('Error deleting update'); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !user || !newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (res.ok) {
        const { task } = await res.json();
        const newTasks = [...tasks, task];
        setTasks(newTasks);

        // Detect @mentions in task title
        const mentions = extractMentions(newTaskTitle);
        for (const email of mentions) {
          await createMentionNotification(email, user.id, selectedProject.id, selectedProject.title, 'update', `task: ${newTaskTitle.substring(0, 80)}`);
        }

        setNewTaskTitle('');
        bumpProjectTaskCounts(newTasks);
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
      if (res.ok) {
        const newTasks = tasks.map(t => t.id === taskId ? { ...t, is_done: isDone } : t);
        setTasks(newTasks);
        bumpProjectTaskCounts(newTasks);
      }
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
      if (res.ok) {
        const newTasks = tasks.filter(t => t.id !== taskId);
        setTasks(newTasks);
        bumpProjectTaskCounts(newTasks);
        notify('Task deleted!');
      }
    } catch { notify('Error deleting task'); }
  };

  // keep project card progress fresh when tasks mutate
  const bumpProjectTaskCounts = (next: Task[]) => {
    if (!selectedProject) return;
    const total = next.length;
    const done = next.filter(t => t.is_done).length;
    setProjects(ps => ps.map(p => p.id === selectedProject.id ? { ...p, tasks_total: total, tasks_done: done } : p));
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

  if (loading) {
    return (
      <div className="app">
        <div style={{ display: 'contents' }} />
      </div>
    );
  }

  const doneTasks = tasks.filter(t => t.is_done).length;
  const selectedProgress = selectedProject ? progressOf({ ...selectedProject, tasks_total: tasks.length, tasks_done: doneTasks }) : 0;

  return (
    <>
      <div className="app">
        <Sidebar
          user={user}
          projectCount={projects.length}
          onLogout={handleLogout}
        />

        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div style={{ minWidth: 0 }}>
              <h1>Projects</h1>
            </div>
            <div className="search">
              <Icon id="search" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, IDs, owners…"
              />
            </div>
            {canEdit && (
              <button className="btn primary" onClick={() => setShowNewForm(v => !v)}>
                <Icon id="plus" />
                <span className="hide-sm">New project</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div id="stats" className="stats">
            <div className="stat">
              <div className="l">Active</div>
              <div className="n" style={{ color: '#8dd13a' }}>{stats.active}</div>
              <div className="spark" />
            </div>
            <div className="stat">
              <div className="l">Bottleneck</div>
              <div className="n" style={{ color: '#e8863a' }}>{stats.blocked}</div>
              <div className="spark" />
            </div>
            <div className="stat">
              <div className="l">Waiting</div>
              <div className="n" style={{ color: '#e8a73a' }}>{stats.waiting}</div>
              <div className="spark" />
            </div>
            <div className="stat grad">
              <div className="l">Completion</div>
              <div className="n">{stats.completion}%</div>
              <div className="spark" />
            </div>
          </div>

          {/* New project form */}
          {showNewForm && (
            <div style={{ padding: '18px 28px 0' }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>New project</div>
                <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label className="label">Project title</label>
                    <input type="text" placeholder="e.g. Sistem Inspectie Automata" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Status })} className="input">
                      <option value="planning">Planning</option>
                      <option value="demo">Demo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="bottleneck">Bottleneck</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  {STATUSES_REQUIRING_CODE.includes(newProject.status) && (
                    <div>
                      <label className="label">Pipedrive code <span style={{ color: '#e8863a' }}>*required</span></label>
                      <input type="text" placeholder="e.g. #260422z1" value={newProject.pipedriveCode} onChange={(e) => setNewProject({ ...newProject, pipedriveCode: e.target.value })} className="input" required />
                    </div>
                  )}
                  {STATUSES_WITHOUT_CODE.includes(newProject.status) && (
                    <div>
                      <label className="label">Pipedrive code <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>(optional)</span></label>
                      <input type="text" placeholder="e.g. #260422z1 (leave empty for planning/demo)" value={newProject.pipedriveCode} onChange={(e) => setNewProject({ ...newProject, pipedriveCode: e.target.value })} className="input" />
                    </div>
                  )}
                  <div>
                    <label className="label">Description (optional)</label>
                    <textarea placeholder="Descriere generală a proiectului..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="input" rows={2} />
                  </div>
                  <div>
                    <label className="label">Bottleneck (optional)</label>
                    <textarea placeholder="Punct de blocare curent..." value={newProject.bottleneck} onChange={(e) => setNewProject({ ...newProject, bottleneck: e.target.value })} className="input" rows={2} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn primary"><Icon id="plus" />Create</button>
                    <button type="button" onClick={() => setShowNewForm(false)} className="btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Kanban */}
          <div style={{ padding: '20px 0 0' }}>
            <div className="kanban">
              {KANBAN_COLUMNS.map((col) => {
                const items = filtered.filter(p => p.status === col);
                const colClass = col === 'in_progress' ? 'st-progress' : col === 'completed' ? 'st-done' : `st-${col}`;
                const dotColor =
                  col === 'in_progress' ? 'var(--gs-green)' :
                  col === 'bottleneck'  ? 'var(--warn)' :
                  col === 'completed'   ? 'var(--gs-blue)' :
                  col === 'waiting'     ? '#e8a73a' :
                                          'var(--ink-3)';
                return (
                  <div key={col} className="kanban-col">
                    <div className={`kanban-head ${colClass}`}>
                      <span className="hc" style={{ background: dotColor }} />
                      <span className="ttl">{STATUS_LABEL[col]}</span>
                      <span className="cnt">{items.length}</span>
                    </div>

                    {items.map(p => {
                      const pct = progressOf(p);
                      const segOn = Math.round(pct / 10);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => openModal(p)}
                          className={`card bold proj-card ${cardStatusClass(p.status)}`}
                          style={{ textAlign: 'left', width: '100%', background: 'var(--surface)', cursor: 'pointer' }}
                        >
                          <div className="rail" />
                          <div className="body">
                            <div className="id-chip mono">{p.pipedrive_code}</div>
                            <div className="title">{p.title}</div>
                            {p.bottleneck && (
                              <div className="alert-strip">
                                <Icon id="alert" size={12} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.bottleneck}
                                </span>
                              </div>
                            )}
                            <div className="progress segmented" aria-label={`Progress ${pct}%`}>
                              {Array.from({ length: 10 }).map((_, i) => (
                                <i key={i} className={i < segOn ? 'on' : ''} />
                              ))}
                            </div>
                            <div className="btm">
                              <div className="avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                                {(p.owner_name ?? '·')[0]?.toUpperCase()}
                              </div>
                              <span className="owner">{p.owner_name ?? 'Unassigned'}</span>
                              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>{pct}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {canEdit && (
                      <button
                        type="button"
                        className="kanban-add"
                        onClick={() => {
                          setNewProject({ title: '', pipedriveCode: '', status: col, description: '', bottleneck: '' });
                          setShowNewForm(true);
                          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        + add card
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {projects.length === 0 && (
            <div style={{ padding: '40px 28px', textAlign: 'center' }}>
              <div className="card" style={{ padding: 36 }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>No projects yet</div>
                <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 14 }}>Start tracking your AI integrations.</div>
                {canEdit && (
                  <button className="btn primary" onClick={() => setShowNewForm(true)}>
                    <Icon id="plus" /> Create your first project
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile tab bar */}
      <MobileTabBar role={user?.role} />

      {/* FAB for new project (mobile) */}
      {canEdit && (
        <button
          type="button"
          className="fab"
          aria-label="New project"
          onClick={() => {
            setShowNewForm(true);
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          +
        </button>
      )}

      {/* Toast */}
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

      {/* Modal */}
      {selectedProject && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--gs-blue)', letterSpacing: '0.05em' }}>
                  {selectedProject.pipedrive_code}
                </span>
                <span className={`chip ${cardStatusClass(selectedProject.status)}`}><span className="dot" />{STATUS_LABEL[selectedProject.status]}</span>
                <div style={{ flex: 1 }} />
                {canEdit && (
                  <>
                    <button
                      className="btn sm"
                      onClick={() => { setEditingStatus(true); setPendingStatus(selectedProject.status); }}
                    >
                      <Icon id="edit" /> Edit status
                    </button>
                    <button
                      className="btn sm danger"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      <Icon id="trash" /> Delete
                    </button>
                  </>
                )}
                <button className="btn sm ghost" onClick={closeModal} aria-label="Close">
                  <Icon id="close" />
                </button>
              </div>
              <div className="display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.015em' }}>
                {selectedProject.title}
              </div>
              <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12, fontSize: 11, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                <span>owner · {selectedProject.owner_name ?? 'Unassigned'}</span>
                <span>created · {formatDateRo(selectedProject.created_at)}</span>
                <span>updated · {relativeTime(selectedProject.updated_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progress</div>
                <div className="progress" style={{ flex: 1, height: 8 }}>
                  <span style={{ width: `${selectedProgress}%` }} />
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>
                  {selectedProgress}% · {doneTasks}/{tasks.length || 0}
                </div>
              </div>

              {editingStatus && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      className="input"
                      style={{ maxWidth: 220 }}
                      value={pendingStatus ?? selectedProject.status}
                      onChange={(e) => setPendingStatus(e.target.value as Status)}
                    >
                      <option value="planning">Planning</option>
                      <option value="demo">Demo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="bottleneck">Bottleneck</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Pipedrive code edit - show only if status requires it or has current code */}
                  {(STATUSES_REQUIRING_CODE.includes(pendingStatus || selectedProject.status)) && (
                    <div>
                      <label className="label" style={{ marginBottom: 6, fontSize: 12 }}>Pipedrive code</label>
                      <input
                        type="text"
                        placeholder="e.g. #260422z1"
                        value={pendingPipedriveCode ?? selectedProject.pipedrive_code ?? ''}
                        onChange={(e) => setPendingPipedriveCode(e.target.value)}
                        className="input"
                        style={{ fontSize: 12 }}
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn primary sm" onClick={handleSaveStatus}>Save</button>
                    <button className="btn sm" onClick={() => { setEditingStatus(false); setPendingStatus(null); setPendingPipedriveCode(null); }}>Cancel</button>
                  </div>
                </div>
              )}

              {deleteConfirm && (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 10, border: '1px solid rgba(230,75,75,0.3)', background: 'rgba(230,75,75,0.08)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#f5a0a0', fontSize: 13 }}>Delete project permanently? This cannot be undone.</span>
                  <button className="btn sm danger" onClick={handleDeleteProject}>Yes, delete</button>
                  <button className="btn sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </div>
              )}
            </div>

            <div className="modal-body">
              {/* LEFT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Description */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div className="label" style={{ marginBottom: 0 }}>Description</div>
                    {canEdit && !editingDescription && (
                      <button
                        className="btn sm ghost"
                        onClick={() => { setEditingDescription(true); setPendingDescription(selectedProject.description ?? ''); }}
                      >
                        <Icon id="edit" size={12} /> Edit
                      </button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <MentionInput
                        value={pendingDescription}
                        onChange={setPendingDescription}
                        placeholder="Descriere generală a proiectului... (tip @ pentru a menține pe cineva)"
                        isTextarea={true}
                        users={users}
                        className="input"
                      />
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: -4 }}>
                        Tip <strong>@email</strong> pentru a menține pe cineva
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn primary sm" onClick={handleSaveDescription}>Save</button>
                        <button className="btn sm" onClick={() => setEditingDescription(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.65, color: selectedProject.description ? 'var(--ink-2)' : 'var(--ink-3)' }}>
                      {selectedProject.description || <em style={{ color: 'var(--ink-3)' }}>No description yet.</em>}
                    </div>
                  )}
                </div>

                {/* Bottleneck */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div className="label" style={{ marginBottom: 0, color: 'var(--warn)' }}>Bottleneck</div>
                    {canEdit && !editingBottleneck && (
                      <button
                        className="btn sm ghost"
                        onClick={() => { setEditingBottleneck(true); setPendingBottleneck(selectedProject.bottleneck ?? ''); }}
                      >
                        <Icon id="edit" size={12} /> Edit
                      </button>
                    )}
                  </div>
                  {editingBottleneck ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <MentionInput
                        value={pendingBottleneck}
                        onChange={setPendingBottleneck}
                        placeholder="Punct de blocare curent... (tip @ pentru a menține pe cineva)"
                        isTextarea={true}
                        users={users}
                        className="input"
                      />
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: -4 }}>
                        Tip <strong>@email</strong> pentru a alertă colegul
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn primary sm" onClick={handleSaveBottleneck}>Save</button>
                        <button className="btn sm" onClick={() => setEditingBottleneck(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : selectedProject.bottleneck ? (
                    <div className="bottleneck">
                      <div className="lbl">
                        <Icon id="alert" size={12} /> Bottleneck
                      </div>
                      <div className="txt">{selectedProject.bottleneck}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--ink-3)' }}><em>No bottleneck identified.</em></div>
                  )}
                </div>

                {/* Tasks */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div className="label" style={{ marginBottom: 0 }}>Pași / Tasks</div>
                    <span className="chip st-progress" style={{ fontSize: 10 }}>{doneTasks}/{tasks.length}</span>
                  </div>
                  <div className="task-list">
                    {tasks.length === 0 && (
                      <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}><em>No tasks yet.</em></div>
                    )}
                    {tasks.map((t) => (
                      <div key={t.id} className={`task ${t.is_done ? 'done' : ''}`}>
                        {canEdit ? (
                          <button
                            type="button"
                            className={`checkbox ${t.is_done ? 'on' : ''}`}
                            onClick={() => handleToggleTask(t.id, !t.is_done)}
                            aria-label={t.is_done ? 'Mark not done' : 'Mark done'}
                          />
                        ) : (
                          <div className={`checkbox ${t.is_done ? 'on' : ''}`} />
                        )}
                        <span className="task-text">{t.title}</span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t.id)}
                            className="btn sm ghost"
                            style={{ padding: 4, color: 'var(--ink-3)' }}
                            aria-label="Delete task"
                          >
                            <Icon id="close" size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <form onSubmit={handleAddTask} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <MentionInput
                          value={newTaskTitle}
                          onChange={setNewTaskTitle}
                          placeholder="Adaugă un pas nou… (@ pentru tag)"
                          users={users}
                          className="input"
                        />
                      </div>
                      <button type="submit" className="btn primary sm"><Icon id="plus" /></button>
                    </form>
                  )}
                </div>
              </div>

              {/* RIGHT — Timeline */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div className="label" style={{ marginBottom: 0 }}>Timeline</div>
                  <div style={{ flex: 1 }} />
                  {canEdit && !showUpdateForm && (
                    <button className="btn primary sm" onClick={() => setShowUpdateForm(true)}>
                      <Icon id="plus" /> Update
                    </button>
                  )}
                </div>

                {showUpdateForm && (
                  <form onSubmit={handleAddUpdate} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                    <div>
                      <label className="label">Ce s-a făcut?</label>
                      <MentionInput isTextarea value={newUpdate.whatDone} onChange={(v) => setNewUpdate({ ...newUpdate, whatDone: v })} users={users} />
                    </div>
                    <div>
                      <label className="label">Ce așteptăm?</label>
                      <MentionInput isTextarea value={newUpdate.whatWaiting} onChange={(v) => setNewUpdate({ ...newUpdate, whatWaiting: v })} users={users} />
                    </div>
                    <div>
                      <label className="label">Next steps</label>
                      <MentionInput isTextarea value={newUpdate.nextSteps} onChange={(v) => setNewUpdate({ ...newUpdate, nextSteps: v })} users={users} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn primary sm">Save</button>
                      <button type="button" className="btn sm" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                {updates.length === 0 ? (
                  <div style={{ color: 'var(--ink-3)', fontSize: 13 }}><em>No updates yet.</em></div>
                ) : (
                  <div className="timeline">
                    {updates.map((u, idx) => {
                      const older = idx > 0;
                      const editing = editingUpdate?.id === u.id;
                      return (
                        <div key={u.id} className={`timeline-item ${older ? 'older' : ''}`}>
                          <div className="dot" />
                          <div className="when">
                            {formatDateRo(u.created_at)} · {u.author_name ?? 'Admin'}
                          </div>
                          {editing ? (
                            <form onSubmit={handleSaveUpdate} style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                              <textarea className="input" rows={2} placeholder="Ce s-a făcut?" value={editingUpdate.what_done ?? ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, what_done: e.target.value })} />
                              <textarea className="input" rows={2} placeholder="Ce așteptăm?" value={editingUpdate.what_waiting ?? ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, what_waiting: e.target.value })} />
                              <textarea className="input" rows={2} placeholder="Next steps" value={editingUpdate.next_steps ?? ''} onChange={(e) => setEditingUpdate({ ...editingUpdate, next_steps: e.target.value })} />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button type="submit" className="btn primary sm">Save</button>
                                <button type="button" className="btn sm" onClick={() => setEditingUpdate(null)}>Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              {u.what_done && (
                                <div className="tl-row">
                                  <span className="k st-done">DONE</span>
                                  <span>{u.what_done}</span>
                                </div>
                              )}
                              {u.what_waiting && (
                                <div className="tl-row">
                                  <span className="k st-waiting">WAIT</span>
                                  <span>{u.what_waiting}</span>
                                </div>
                              )}
                              {u.next_steps && (
                                <div className="tl-row">
                                  <span className="k" style={{ background: 'var(--blue-bg)', color: 'var(--gs-blue)' }}>NEXT</span>
                                  <span>{u.next_steps}</span>
                                </div>
                              )}
                              {canEdit && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                  {deleteUpdateConfirm === u.id ? (
                                    <>
                                      <button className="btn sm danger" onClick={() => handleDeleteUpdate(u.id)}>Confirm delete</button>
                                      <button className="btn sm" onClick={() => setDeleteUpdateConfirm(null)}>Cancel</button>
                                    </>
                                  ) : (
                                    <>
                                      <button className="btn sm ghost" onClick={() => setEditingUpdate(u)}><Icon id="edit" size={12} /></button>
                                      <button className="btn sm ghost" onClick={() => setDeleteUpdateConfirm(u.id)} style={{ color: 'var(--danger)' }}><Icon id="trash" size={12} /></button>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationPrompt />
    </>
  );
}
