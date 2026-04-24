'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from './Icon';

type User = { id: number; email: string; display_name?: string; role: 'admin' | 'editor' | 'viewer' };

type Props = {
  user: User | null;
  projectCount?: number;
  userCount?: number;
  onLogout?: () => void;
};

function initials(name?: string, email?: string) {
  if (name && name.trim()) return name.trim()[0].toUpperCase();
  if (email && email.length) return email[0].toUpperCase();
  return '·';
}

function displayName(u: User | null) {
  return (u?.display_name && u.display_name.trim()) || u?.email?.split('@')[0] || 'Account';
}

export default function Sidebar({ user, projectCount, userCount, onLogout }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const onProjects = pathname === '/projects' || pathname?.startsWith('/projects/');
  const onUsers = pathname === '/admin/users';
  const onStats = pathname === '/stats';
  const onInbox = pathname === '/inbox';

  return (
    <aside className="sidebar">
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Global Source" className="mark" />
        <div>
          <div className="name">AI Tracker</div>
          <div className="sub">Global Source</div>
        </div>
      </div>

      <div className="nav-label">Workspace</div>

      <Link
        href="/projects"
        className={`nav-item ${onProjects ? 'active' : ''}`}
        prefetch={false}
      >
        <Icon id="board" />
        <span>Projects</span>
        {typeof projectCount === 'number' && <span className="nav-count">{projectCount}</span>}
      </Link>

      {user?.role === 'admin' && (
        <Link
          href="/admin/users"
          className={`nav-item ${onUsers ? 'active' : ''}`}
          prefetch={false}
        >
          <Icon id="users" />
          <span>Users</span>
          {typeof userCount === 'number' && <span className="nav-count">{userCount}</span>}
        </Link>
      )}

      <div className="footer">
        <div className="user-chip" onClick={onLogout} role={onLogout ? 'button' : undefined}>
          <div className="avatar">{initials(user?.display_name, user?.email)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="who" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName(user)}
            </div>
            <div className="role-label">
              {user?.role ?? 'guest'}
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onLogout?.(); }}
              aria-label="Sign out"
              className="btn ghost"
              style={{ padding: 6 }}
            >
              <Icon id="logout" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* keep reference to router to avoid unused warning if strict */}
      <span style={{ display: 'none' }} aria-hidden>{router ? '' : ''}</span>
    </aside>
  );
}
