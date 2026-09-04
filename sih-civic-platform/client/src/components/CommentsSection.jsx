import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getRoleBadgeInfo } from '../utils/rbac';

export default function CommentsSection({ entityId, entityType = 'complaint' }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const storageKey = `comments_${entityType}_${entityId}`;

  const [comments, setComments] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (_e) {}

    // Default discussion thread for demo richness
    return [
      {
        id: 'c1',
        authorName: 'Rahul Kumar',
        authorRole: 'citizen',
        organization: 'Angara Gram Panchayat',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        message: 'Drinking water handpump near the primary school is completely non-operational. Over 300 students and families are affected.'
      },
      {
        id: 'c2',
        authorName: 'Nodal Officer Rajesh Varma',
        authorRole: 'admin',
        organization: 'Dept of IT & e-Governance, GoJ',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        message: 'Grievance triaged by AI system with 94% confidence. Escalated to Drinking Water & Sanitation Dept and matched to BIT Mesra Capstone Hub.'
      },
      {
        id: 'c3',
        authorName: 'Dr. Anita Sharma (PI)',
        authorRole: 'university',
        organization: 'BIT Mesra Innovation Cell',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        message: 'Our Department of Environmental Engineering has reviewed the problem statement. Proposing a solar submersible pump with inline filtration retrofit.'
      }
    ];
  });

  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(comments));
    } catch (_e) {}
  }, [comments, storageKey]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `comment_${Date.now()}`,
      authorName: user?.name || 'Authorized Official',
      authorRole: user?.role || 'citizen',
      organization: user?.organization || 'Government of Jharkhand Stakeholder',
      timestamp: new Date().toISOString(),
      message: newComment.trim()
    };

    setComments((prev) => [...prev, commentObj]);
    setNewComment('');
    showToast('Stakeholder response posted to official dossier thread', 'success');
  };

  return (
    <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center border border-primary-container/30">
            <span className="material-symbols-outlined text-xl">forum</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              Multi-Stakeholder Coordination Thread
            </h3>
            <p className="text-xs text-secondary">
              Official dialogue between Citizen, University Researchers, Industry CSR, and State Officers
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-secondary border border-surface-container-highest">
          {comments.length} Messages
        </span>
      </div>

      {/* Discussion List */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {comments.map((comment) => {
          const badge = getRoleBadgeInfo(comment.authorRole);
          const timeStr = new Date(comment.timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          return (
            <div
              key={comment.id}
              className="p-4 rounded-xl sm:rounded-2xl bg-surface-container border border-surface-container-highest/80 space-y-2 hover:border-surface-container-highest transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">
                    {comment.authorName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface mr-2">
                      {comment.authorName}
                    </span>
                    <span className="text-[11px] text-secondary">
                      ({comment.organization})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.badgeColor}`}
                  >
                    <span className="material-symbols-outlined text-[12px]">{badge.icon}</span>
                    <span className="capitalize">{badge.label}</span>
                  </span>
                  <span className="text-[10px] text-secondary">{timeStr}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed pl-9">
                {comment.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Post Comment Input */}
      <form onSubmit={handlePostComment} className="pt-2 space-y-3">
        <div className="flex items-center gap-2 text-xs text-secondary font-medium">
          <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
          <span>
            Posting as: <strong className="text-on-surface">{user?.name}</strong> ({user?.role?.toUpperCase()})
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add official stakeholder feedback, progress update, or technical note..."
            className="flex-1 bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-secondary/60 focus:border-primary-container outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span className="hidden sm:inline">Post Comment</span>
          </button>
        </div>
      </form>
    </div>
  );
}
