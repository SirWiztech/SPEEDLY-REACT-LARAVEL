import { useState, useEffect, useRef, useCallback } from 'react';

interface NotificationEvent {
  title: string;
  message: string;
  type: string;
}

export function useRealtimeNotifications(userId: string | null) {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const echoRef = useRef<any>(null);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // Ignore autoplay restrictions
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const setup = async () => {
      try {
        const Pusher = (await import('pusher-js')).default;
        const Echo = (await import('laravel-echo')).default;

        const isProd = window.location.protocol === 'https:';
        const wsHost = window.location.hostname;

        const echo = new Echo({
          broadcaster: 'pusher',
          key: 'speedlykey',
          wsHost: isProd ? wsHost : '127.0.0.1',
          wsPort: isProd ? 443 : 8080,
          wssPort: 443,
          forceTLS: isProd,
          encrypted: isProd,
          disableStats: true,
        });

        echo.connector.socket.on('connect', () => {
          if (!cancelled) setConnected(true);
        });
        echo.connector.socket.on('disconnect', () => {
          if (!cancelled) setConnected(false);
        });

        const channel = echo.private(`App.Models.User.${userId}`);
        channel.notification((notification: NotificationEvent) => {
          if (cancelled) return;
          setNotifications(prev => [notification, ...prev]);
          setCount(prev => prev + 1);
          playNotificationSound();
        });

        echoRef.current = echo;
      } catch (e) {
        console.warn('[Notifications] WebSocket setup failed:', e);
      }
    };

    setup();
    return () => {
      cancelled = true;
      if (echoRef.current) {
        try { echoRef.current.disconnect(); } catch {}
        echoRef.current = null;
      }
    };
  }, [userId, playNotificationSound]);

  const resetCount = useCallback(() => setCount(0), []);

  return { count, notifications, connected, resetCount };
}
