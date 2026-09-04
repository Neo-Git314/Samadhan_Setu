import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-highest transition-colors text-secondary hover:text-on-surface"
      title="Notifications & Alerts"
    >
      <span className="material-symbols-outlined text-[20px]">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-container text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
