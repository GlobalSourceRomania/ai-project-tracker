'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Real-time unread notification count — three update strategies:
 * 1. Poll /api/notifications/count every 8s (only when tab is visible)
 * 2. Refresh immediately when tab regains focus (Page Visibility API)
 * 3. Refresh immediately when a push notification arrives (SW message)
 *
 * Also syncs the OS app-icon badge via navigator.setAppBadge() so the
 * red number appears on the home-screen icon (iOS 16.4+ PWA, Android Chrome).
 */
export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  const fetchingRef = useRef(false);

  // Update app-icon badge whenever count changes
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    if (count > 0) {
      (navigator as any).setAppBadge(count).catch(() => {});
    } else {
      (navigator as any).clearAppBadge().catch(() => {});
    }
  }, [count]);

  const fetchCount = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/notifications/count', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch {
      // silently ignore
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Strategy 1: poll every 8s (visible tab only)
    const interval = setInterval(() => {
      if (!document.hidden) fetchCount();
    }, 8_000);

    // Strategy 2: immediate refresh on tab focus
    const onVisibility = () => { if (!document.hidden) fetchCount(); };
    document.addEventListener('visibilitychange', onVisibility);

    // Strategy 3: immediate refresh on push notification
    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PUSH_RECEIVED') fetchCount();
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, [fetchCount]);

  return count;
}
