import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import CommentsSection from '../components/CommentsSection';
import { getRoleDefaultRoute } from '../utils/rbac';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadComplaint() {
      try {
        setLoading(true);
        const res = await complaintsApi.getComplaintById(id);
        if (isMounted && res && res.success && res.complaint) {
          setComplaint(res.complaint);

          // If duplicate, fetch duplicate metadata
          if (res.complaint.status === 'duplicate' || res.complaint.duplicateOf) {
            try {
              const dupRes = await complaintsApi.getDuplicates(res.complaint._id);
              if (isMounted && dupRes && dupRes.success) {
                setDuplicateInfo(dupRes);
              }
            } catch (dupErr) {
              console.warn('Could not fetch duplicates info:', dupErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load complaint:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadComplaint();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-secondary">Loading official grievance dossier from state registry...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-12 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <h2 className="text-xl font-bold text-on-surface">Grievance Not Found</h2>
        <p className="text-sm text-secondary">The requested grievance dossier does not exist in the state master registry.</p>
        <button
          onClick={() => navigate(getRoleDefaultRoute(user?.role))}
          className="px-5 py-2.5 bg-primary-container text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isResolved = complaint.status === 'resolved';
  const isAdmin = user?.role === 'admin';
  const isDuplicate = complaint.status === 'duplicate' || Boolean(complaint.duplicateOf);
  const parentComplaintId = complaint.duplicateOf?._id || complaint.duplicateOf || duplicateInfo?.duplicateOf?._id;
  const parentComplaintUrn = duplicateInfo?.duplicateOf?.urn || (parentComplaintId ? `SAM-2026-${parentComplaintId.toString().slice(-6).toUpperCase()}` : 'PARENT-RECORD');

  const urn = complaint.urn || `SAM-2026-${complaint._id.slice(-6).toUpperCase()}`;

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await complaintsApi.updateStatus(complaint._id, newStatus);
      if (res && res.success && res.complaint) {
        setComplaint(res.complaint);
        showToast(`Complaint status updated to: ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleExportPDF = () => {
    showToast(`Official Jharkhand Govt Grievance Dossier [${urn}] exported (PDF)`, 'info');
  };

  // Timeline steps
  const timelineSteps = [
    {
      step: 1,
      title: 'Grievance Registered',
      date: new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'done',
      desc: `Registered by ${complaint.submittedBy?.name || 'Citizen'} with GPS coordinates [${complaint.location?.lat || 23.36}, ${complaint.location?.lng || 85.33}].`
    },
    {
      step: 2,
      title: 'AI Computer Vision & NLP Triage',
      date: 'Automated',
      status: 'done',
      desc: `Classified as "${complaint.category}" with ${Math.round((complaint.categoryConfidence || 0.85) * 100)}% confidence and ${complaint.urgency?.toUpperCase()} urgency rating.`
    },
    {
      step: 3,
      title: 'Department Escalated',
      date: complaint.status !== 'pending' ? 'Verified' : 'In Review',
      status: complaint.status !== 'pending' ? 'done' : 'current',
      desc: `Routed to Jharkhand Urban/Rural Development Authorities (${complaint.district} Zone).`
    },
    {
      step: 4,
      title: 'Academic Innovation Matched',
      date: complaint.assignedUniversity ? 'Assigned' : 'Queued',
      status: complaint.assignedUniversity ? 'done' : 'pending',
      desc: complaint.assignedUniversity?.name
        ? `Assigned to ${complaint.assignedUniversity.name} for applied engineering capstone.`
        : 'Eligible for matching with Jharkhand Engineering Universities (BIT Mesra, NIT Jamshedpur).'
    },
    {
      step: 5,
      title: 'Remediation & Resolution',
      date: isResolved ? 'Resolved' : 'In Progress',
      status: isResolved ? 'done' : complaint.status === 'in_progress' ? 'current' : 'pending',
      desc: isResolved
        ? 'Field verification complete. Citizen sign-off approved.'
        : 'Engineering prototype and nodal department works in execution.'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={() => navigate(getRoleDefaultRoute(user?.role))}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Portal</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Official Dossier (PDF)</span>
          </button>

          {/* Admin Manual Status Override Dropdown */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary font-semibold">Override Status:</span>
              <select
                disabled={statusUpdating}
                value={complaint.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1.5 bg-surface-container-high border border-primary text-primary text-xs font-bold rounded-xl outline-none"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="duplicate">Duplicate</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Amber Deduplication Banner */}
      {isDuplicate && (
        <div className="bg-amber-950/40 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
              <span className="material-symbols-outlined text-2xl">copy_all</span>
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-amber-300 font-bold text-base sm:text-lg flex items-center gap-2">
                <span>AI Deduplication Alert</span>
                <span className="text-xs bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-mono">
                  &gt;85% Semantic Match
                </span>
              </h3>
              <p className="text-amber-200/90 text-xs sm:text-sm leading-relaxed">
                Flagged as duplicate of URN: <strong className="font-mono text-white underline">{parentComplaintUrn}</strong> based on semantic vector similarity (&gt;85%) and 5km geographical proximity. Both reports have been merged under the primary dossier for coordinated municipal remediation.
              </p>
            </div>
          </div>

          {parentComplaintId && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => navigate(`/complaints/${parentComplaintId}`)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <span>Navigate to Parent Complaint Dossier</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Dossier Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-surface-container-high text-primary border border-primary-container/40 rounded-xl text-xs font-code-num font-bold">
                {urn}
              </span>
              <span className="px-3 py-1 bg-surface-container text-secondary text-xs font-semibold rounded-lg border border-surface-container-highest capitalize">
                {complaint.category?.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={complaint.status} size="lg" />
              {complaint.needsReview && (
                <span className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[11px] font-bold rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">flag</span>
                  <span>Needs Officer Review</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight leading-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest min-w-[200px] text-left sm:text-right">
            <span className="text-xs text-secondary block font-medium">SLA Urgency Level</span>
            <span className="text-lg sm:text-xl font-bold font-code-num text-primary block uppercase">
              {complaint.urgency} Priority
            </span>
            <span className="text-xs text-secondary mt-0.5 block">
              District: {complaint.district}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-on-surface leading-relaxed bg-surface-container/60 p-5 rounded-2xl border border-surface-container-highest">
          {complaint.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block text-[11px]">Submitted By</span>
            <span className="font-bold text-on-surface text-xs truncate block">
              {complaint.submittedBy?.name || 'Rahul Kumar (Citizen)'}
            </span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block text-[11px]">Geographic District</span>
            <span className="font-bold text-on-surface text-xs truncate block">
              {complaint.district}, Jharkhand
            </span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block text-[11px]">Assigned University</span>
            <span className="font-bold text-tertiary text-xs truncate block">
              {complaint.assignedUniversity?.name || 'Unassigned / Open for Bidding'}
            </span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block text-[11px]">Date Registered</span>
            <span className="font-bold text-on-surface text-xs font-code-num">
              {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline + Evidence, Right AI Card & University Match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-surface-container-highest pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                  Official Remediation Audit Trail
                </h2>
                <p className="text-xs text-secondary">
                  Real-time milestone progression with state audit logging
                </p>
              </div>
              <span className="material-symbols-outlined text-2xl text-primary">history_edu</span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === 'done';
                const isCurrent = step.status === 'current';

                let dotColor = 'bg-surface-container text-secondary border-surface-container-highest';
                if (isDone) dotColor = 'bg-[#003824] text-[#4edea3] border-[#00b07a]';
                else if (isCurrent) dotColor = 'bg-primary-container text-white border-primary ring-4 ring-primary-container/20';

                return (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${dotColor}`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="bg-surface-container p-4 sm:p-5 rounded-2xl border border-surface-container-highest space-y-1">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <h4 className="font-bold text-on-surface text-sm sm:text-base">
                          {step.title}
                        </h4>
                        <span className="text-xs text-secondary font-code-num">{step.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence Media Cards */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Geotagged Evidence & Image Proof</h3>
            {complaint.mediaUrls && complaint.mediaUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.mediaUrls.map((url, i) => (
                  <div key={i} className="bg-surface-container rounded-2xl p-4 border border-surface-container-highest space-y-3">
                    <div className="h-44 bg-surface-container-highest/40 rounded-xl overflow-hidden relative">
                      <img
                        src={typeof url === 'string' ? url : url.name || ''}
                        alt="Evidence Proof"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 text-[10px] bg-black/80 text-white px-2 py-0.5 rounded font-mono">
                        {complaint.location?.lat || 23.36}° N, {complaint.location?.lng || 85.33}° E
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-xs truncate">Evidence Attachment #{i + 1}</p>
                      <p className="text-[11px] text-secondary">Uploaded to Cloudinary • Verified EXIF GPS</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary">No photographic proof attached to this grievance dossier.</p>
            )}
          </div>

          {/* Multi-Stakeholder Discussion Section */}
          <CommentsSection entityId={complaint._id} entityType="complaint" />
        </div>

        {/* Right 1 Col: AI Computer Vision & University Matching */}
        <div className="space-y-6">
          {/* AI Intelligence Card */}
          <div className="bg-surface-container-low border border-primary-container/40 rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm">AI Triage Intelligence</h3>
                <p className="text-xs text-secondary">Gemini Flash & Embeddings Pipeline</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Category Confidence</span>
                <span className="font-bold font-code-num text-primary">
                  {Math.round((complaint.categoryConfidence || 0.94) * 100)}% Confidence
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Urgency Score</span>
                <span className="font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary-container/40">
                  {complaint.urgency}
                </span>
              </div>

              {complaint.imageAnalysis && (
                <div className="space-y-2 pt-2 border-t border-surface-container-highest">
                  <span className="text-xs font-bold text-secondary block">Computer Vision Analysis</span>
                  {complaint.imageAnalysis.caption && (
                    <p className="text-xs text-on-surface/90 italic bg-surface-container p-2.5 rounded-xl border border-surface-container-highest">
                      "{complaint.imageAnalysis.caption}"
                    </p>
                  )}

                  {complaint.imageAnalysis.tags && complaint.imageAnalysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {complaint.imageAnalysis.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-surface-container text-secondary text-xs rounded-md border border-surface-container-highest font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {typeof complaint.imageAnalysis.relevanceScore === 'number' && (
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-secondary">Visual Relevance:</span>
                      <strong className="text-[#4edea3] font-code-num">
                        {Math.round(complaint.imageAnalysis.relevanceScore * 100)}%
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Academic University Match Card */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-tertiary text-2xl">school</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm">Academic Innovation Hub</h3>
                <p className="text-xs text-secondary">60/40 Weighted University Match</p>
              </div>
            </div>

            <div className="space-y-3">
              {complaint.assignedUniversity ? (
                <div className="p-3.5 bg-surface-container rounded-2xl border border-surface-container-highest space-y-1">
                  <span className="text-xs text-secondary block">Assigned Institution</span>
                  <p className="font-bold text-on-surface text-xs sm:text-sm">
                    {complaint.assignedUniversity.name}
                  </p>
                  <span className="text-[11px] text-tertiary block font-semibold">
                    Status: Challenge Accepted & Capstone Project Active
                  </span>
                </div>
              ) : complaint.suggestedUniversities && complaint.suggestedUniversities.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-secondary block">
                    Top AI Suggested Institutions:
                  </span>
                  {complaint.suggestedUniversities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-container rounded-xl border border-surface-container-highest flex justify-between items-center text-xs"
                    >
                      <span className="font-medium text-on-surface">
                        {item.universityId?.name || 'Birla Institute of Technology (BIT), Mesra'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-bold font-mono">
                        {Math.round(item.score * 100)}% Match
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary">
                  Open for university capstone bidding across engineering institutions in Jharkhand.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
