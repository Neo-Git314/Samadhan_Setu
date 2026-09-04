import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('ALL');

  const filteredNotifs = (notifications || []).filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const handleMarkAll = () => {
    markAllAsRead();
    showToast('All notifications marked as read', 'info');
  };

  const handleClickNotif = (notif) => {
    markAsRead(notif._id);
    if (notif.relatedId) {
      if (notif.type === 'industry_invitation' || notif.type === 'industry_invite_accepted') {
        navigate(`/university/projects/${notif.relatedId}`);
      } else {
        navigate(`/complaints/${notif.relatedId}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            <span>Real-Time Audit System Alerts</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface">
            Notifications & SLA Alerts
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Multi-stakeholder dispatch alerts, milestone progressions, and officer escalations
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-bold text-secondary hover:text-on-surface transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-base">done_all</span>
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-primary-container text-white font-bold shadow-sm'
              : 'bg-surface-container-low border border-surface-container-highest text-secondary hover:text-on-surface'
          }`}
        >
          All ({(notifications || []).length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'UNREAD'
              ? 'bg-primary-container text-white font-bold shadow-sm'
              : 'bg-surface-container-low border border-surface-container-highest text-secondary hover:text-on-surface'
          }`}
        >
          Unread ({(notifications || []).filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-secondary">notifications_off</span>
            <p className="text-sm font-semibold text-on-surface">No alerts found</p>
            <p className="text-xs text-secondary">You are completely up to date with all state workflows.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const timeStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : 'Recently';

            return (
              <div
                key={notif._id}
                onClick={() => handleClickNotif(notif)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  notif.read
                    ? 'bg-surface-container-low border-surface-container-highest opacity-75'
                    : 'bg-surface-container border-primary/40 shadow-sm'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.read
                      ? 'bg-surface-container-high text-secondary'
                      : 'bg-primary-container/20 text-primary border border-primary-container/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {notif.type === 'industry_invitation'
                      ? 'handshake'
                      : notif.type === 'challenge_accepted'
                      ? 'school'
                      : notif.type === 'duplicate_detected'
                      ? 'copy_all'
                      : 'info'}
                  </span>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      {notif.type?.replace(/_/g, ' ') || 'System Alert'}
                    </span>
                    <span className="text-[10px] text-secondary font-mono">{timeStr}</span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-on-surface leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container shrink-0 mt-2"></span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
