'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '@/lib/service-worker-register';

/**
 * Prompt for push notification permission on first visit
 */
export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) return;

    // Only show if notifications are supported and not yet granted
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
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-[#00B4EF] to-[#8DC63F] rounded-lg shadow-xl p-4 max-w-sm z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-white mt-0.5">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.5 1.5H9.5V.5h1v1zm-8 8h-1V8.5h1v1zM19 9.5h-1v-1h1v1zm-9.5 8h1v1h-1v-1zm7.53-2.97l.707.707-.707-.707zm-15.06 0l-.707.707.707-.707z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-[#080D1A] mb-1">
            Stay Updated
          </h3>
          <p className="text-sm text-[#080D1A]/90 mb-3">
            Get notified when projects are created or modified by your team
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-3 py-1.5 bg-[#080D1A] text-white rounded text-sm font-medium hover:bg-[#111827] disabled:opacity-50 transition"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="px-3 py-1.5 bg-white/20 text-[#080D1A] rounded text-sm font-medium hover:bg-white/30 transition"
            >
              Later
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-[#080D1A]/70 hover:text-[#080D1A] transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
