'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Real-time unread notification count.
 *
 * Three-pronged update strategy:
 *  1. Polls /api/notifications/count every 8 seconds (visible tab only)
 *  2. Refreshes immediately when the tab regains focus (Page Visibility API)
 *  3. Refreshes immediately when a push notification arrives via Service Worker
 */
export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  const fetchingRef = useRef(false);

  const fetchCount = useCallback(async () => {
    if (fetchingRef.current) return; // skip overlapping calls
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/notifications/count', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch {
      // silently ignore network errors
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Strategy 1: Poll every 8s — only when tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) fetchCount();
    }, 8_000);

    // Strategy 2: Immediate refresh when tab becomes visible
    const onVisibility = () => {
      if (!document.hidden) fetchCount();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Strategy 3: Immediate refresh when push notification received
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_RECEIVED') fetchCount();
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
