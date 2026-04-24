'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '@/lib/service-worker-register';
import Icon from './Icon';

/**
 * Prompts the user to enable push notifications.
 * - Shows on first visit if permission is 'default'
 * - Re-shows after 24 h if user dismissed with "Later"
 * - Never re-shows if the user explicitly denied (Notification.permission === 'denied')
 */
export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Not supported
    if (!('Notification' in window)) return;
    // Already denied by the browser — nothing we can do
    if (Notification.permission === 'denied') return;
    // Already granted — subscribe silently, no prompt needed
    if (Notification.permission === 'granted') {
      requestNotificationPermission().catch(() => {});
      return;
    }

    // "default" — check if the user explicitly dismissed with "Later"
    const snoozed = localStorage.getItem('notif-prompt-snoozed');
    if (snoozed) {
      const snoozedAt = parseInt(snoozed, 10);
      const hoursSince = (Date.now() - snoozedAt) / 3_600_000;
      if (hoursSince < 24) return; // wait 24 h before asking again
    }

    setShow(true);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestNotificationPermission();
    setLoading(false);
    if (granted) {
      localStorage.removeItem('notif-prompt-snoozed');
      setShow(false);
    }
    // If not granted (user denied in OS dialog), hide anyway
    setShow(false);
  };

  const handleLater = () => {
    localStorage.setItem('notif-prompt-snoozed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="notif-title"
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        right: 16,
        zIndex: 200,
        maxWidth: 340,
        width: 'calc(100vw - 32px)',
      }}
      className="card bold"
    >
      <div style={{ height: 3, background: 'var(--grad)' }} />
      <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--grad-soft)',
            border: '1px solid rgba(141,209,58,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gs-green)',
            flexShrink: 0,
          }}
        >
          <Icon id="bell" size={18} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div id="notif-title" className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            Activează notificările
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 12px' }}>
            Primești un ping când un coleg modifică sau creează proiecte — chiar și cu aplicația închisă.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleEnable} disabled={loading} className="btn primary sm" type="button">
              {loading ? 'Se activează…' : '🔔 Activează'}
            </button>
            <button onClick={handleLater} disabled={loading} className="btn sm" type="button">
              Mai târziu
            </button>
          </div>
        </div>

        <button onClick={handleLater} className="btn ghost sm" style={{ padding: 4, color: 'var(--ink-3)' }} aria-label="Dismiss" type="button">
          <Icon id="close" size={14} />
        </button>
      </div>
    </div>
  );
}
