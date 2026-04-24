'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon, { type IconId } from './Icon';
import { useUnreadCount } from '@/hooks/useUnreadCount';

type Role = 'admin' | 'editor' | 'viewer' | undefined;

type Tab = {
  key: string;
  label: string;
  href: string;
  icon: IconId;
  match: (path: string) => boolean;
  adminOnly?: boolean;
};

const TABS: Tab[] = [
  { key: 'projects', label: 'Projects', href: '/projects',    icon: 'board',  match: p => p.startsWith('/projects') },
  { key: 'stats',    label: 'Stats',    href: '/stats',       icon: 'stats',  match: p => p.startsWith('/stats') },
  { key: 'team',     label: 'Team',     href: '/admin/users', icon: 'users',  match: p => p.startsWith('/admin/users'), adminOnly: true },
  { key: 'inbox',    label: 'Inbox',    href: '/inbox',       icon: 'inbox',  match: p => p.startsWith('/inbox') },
];

export default function MobileTabBar({ role }: { role: Role }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const unreadCount = useUnreadCount();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    router.push('/login');
  };

  return (
    <>
      <nav className="tabbar" aria-label="Primary navigation">
        {TABS.map(tab => {
          if (tab.adminOnly && role !== 'admin') return null;
          const active = tab.match(pathname);
          const isInbox = tab.key === 'inbox';
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`tab ${active ? 'on' : ''}`}
              prefetch={false}
            >
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon id={tab.icon} size={20} />
                {isInbox && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: 'var(--gs-blue)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
        <button
          className="tab"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Menu"
          title="Menu"
        >
          <Icon id="logout" size={20} />
          Menu
        </button>
      </nav>

      {showMenu && (
        <div className="mobile-menu">
          <button onClick={handleLogout} className="menu-item danger">
            <Icon id="logout" size={16} />
            Logout
          </button>
          <button onClick={() => setShowMenu(false)} className="menu-item">
            <Icon id="close" size={16} />
            Close
          </button>
        </div>
      )}
    </>
  );
}
