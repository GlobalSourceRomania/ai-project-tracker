'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon, { type IconId } from './Icon';

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
  { key: 'projects', label: 'Projects', href: '/projects',   icon: 'board', match: p => p.startsWith('/projects') },
  { key: 'stats',    label: 'Stats',    href: '/projects#stats', icon: 'stats', match: () => false },
  { key: 'team',     label: 'Team',     href: '/admin/users', icon: 'users', match: p => p.startsWith('/admin/users'), adminOnly: true },
  { key: 'inbox',    label: 'Inbox',    href: '/projects#inbox', icon: 'inbox', match: () => false },
];

export default function MobileTabBar({ role }: { role: Role }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

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
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`tab ${active ? 'on' : ''}`}
              prefetch={false}
            >
              <Icon id={tab.icon} size={20} />
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
