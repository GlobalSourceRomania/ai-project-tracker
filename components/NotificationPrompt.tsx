'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '@/lib/service-worker-register';
import Icon from './Icon';

/**
 * Bottom-right toast prompting the user to enable push notifications.
 * Shown once per device; dismissal is persisted to localStorage.
 */
export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) return;
    if ('Notification' in window && Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestNotificationPermission();
    setLoading(false);
    if (granted) {
      localStorage.setItem('notification-prompt-dismissed', 'true');
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="notif-title"
      style={{
        position: 'fixed',
        bottom: 'calc(92px + env(safe-area-inset-bottom, 0))',
        right: 16,
        zIndex: 60,
        maxWidth: 360,
        width: 'calc(100vw - 32px)',
      }}
      className="card bold"
    >
      <div style={{ height: 3, background: 'var(--grad)' }} />
      <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--grad-soft)',
            border: '1px solid rgba(141,209,58,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gs-green)',
            flexShrink: 0,
          }}
        >
          <Icon id="bell" size={16} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div id="notif-title" className="display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            Stay in the loop
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0, marginBottom: 10 }}>
            Get pinged when your team creates or updates projects.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="btn primary sm"
              type="button"
            >
              {loading ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="btn sm"
              type="button"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="btn ghost sm"
          style={{ padding: 4, color: 'var(--ink-3)' }}
          aria-label="Dismiss"
          type="button"
        >
          <Icon id="close" size={14} />
        </button>
      </div>
    </div>
  );
}
