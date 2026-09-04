import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('ALL');

  const filteredNotifs = (notifications || []).filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const handleMarkAll = () => {
    markAllNotificationsRead();
    showToast('All notifications marked as read', 'info');
  };

  const handleClickNotif = (notif) => {
    markNotificationRead(notif._id);
    if (notif.relatedId) {
      navigate(`/complaints/${notif.relatedId}`);
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
            {t('nav_notifications', 'Notifications & SLA Alerts')}
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

      {/* List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-12 text-center text-secondary">
            No notifications to display.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotif(n)}
              className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-sm ${
                !n.read
                  ? 'bg-surface-container border-primary-container/60 hover:border-primary'
                  : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                  !n.read
                    ? 'bg-primary-container/20 text-primary border-primary-container/30'
                    : 'bg-surface-container-high text-secondary border-surface-container-highest'
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {n.type === 'status_change' ? 'published_with_changes' : 'notifications'}
                  </span>
                </div>
                <div>
                  <p className={`text-xs sm:text-sm ${!n.read ? 'font-bold text-on-surface' : 'text-secondary'}`}>
                    {n.message}
                  </p>
                  <span className="text-[11px] text-secondary font-code-num mt-1 block">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
