'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
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
    </nav>
  );
}
