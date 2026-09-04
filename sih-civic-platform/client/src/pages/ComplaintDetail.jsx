import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { getRoleDefaultRoute } from '../utils/rbac';

function ComplaintDetail() {
  const { id } = useParams();
  const { complaints, toggleComplaintStatus } = useData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Find complaint by _id or urn
  const complaint = complaints.find((c) => c._id === id || c.urn === id) || complaints[0];

  if (!complaint) {
    return (
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-12 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <h2 className="text-xl font-bold text-on-surface">Grievance Not Found</h2>
        <p className="text-sm text-secondary">The requested grievance dossier does not exist in the national registry.</p>
        <button
          onClick={() => navigate(getRoleDefaultRoute(user?.role))}
          className="px-5 py-2.5 bg-primary-container text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';
  const isAdmin = user?.role === 'admin';

  const handleStatusToggle = () => {
    toggleComplaintStatus(complaint._id);
    const newStatus = isResolved ? 'In Progress' : 'Resolved';
    showToast(`Complaint status updated to: ${newStatus}`, 'success');
  };

  const handleExportPDF = () => {
    showToast('Official Jharkhand Govt Grievance PDF Dossier exported to downloads', 'info');
  };

  const timelineSteps = complaint.timeline || [
    { step: 1, title: 'Grievance Registered', date: '06 Feb 2026, 08:15 AM', status: 'done', desc: 'Registered via Jharkhand Single Sign-On with GPS geotag.' },
    { step: 2, title: 'AI NLP Triaged & Verified', date: '06 Feb 2026, 08:16 AM', status: 'done', desc: 'Computer vision verified turbidity >14 NTU. SLA set to Critical (12h).' },
    { step: 3, title: 'Department Escalated', date: '06 Feb 2026, 09:00 AM', status: 'done', desc: `Auto-dispatched to ${complaint.department || 'Drinking Water & Sanitation Dept (DWSD)'}.` },
    { step: 4, title: 'Academic Innovation Matched', date: '06 Feb 2026, 10:30 AM', status: 'done', desc: 'Assigned to BIT Mesra Innovation Hub.' },
    { step: 5, title: 'Field Remediation Underway', date: '06 Feb 2026, 01:15 PM', status: isResolved ? 'done' : 'current', desc: 'Engineers on site testing IoT telemetry water sensors.' },
    { step: 6, title: 'Resolution & Citizen Sign-off', date: isResolved ? 'Resolved' : 'Pending', status: isResolved ? 'done' : 'pending', desc: 'Citizen OTP sign-off and water lab certificate.' }
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Official Dossier (PDF)</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleStatusToggle}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                isResolved
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30'
                  : 'bg-[#003824] text-[#4edea3] border border-[#00b07a] hover:bg-[#004d32]'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isResolved ? 'replay' : 'check_circle'}
              </span>
              <span>{isResolved ? 'Re-Open Grievance' : 'Mark as Resolved'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-surface-container-high text-primary border border-primary-container/40 rounded-xl text-xs font-code-num font-bold">
                {complaint.urn}
              </span>
              <span className="px-3 py-1 bg-surface-container text-secondary text-xs font-semibold rounded-lg border border-surface-container-highest">
                {complaint.category}
              </span>
              <StatusBadge status={complaint.status} size="lg" />
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight leading-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest min-w-[200px] text-left sm:text-right">
            <span className="text-xs text-secondary block font-medium">SLA Resolution Window</span>
            <span className="text-xl font-bold font-code-num text-primary block">
              {complaint.slaLeft || '12h Left'}
            </span>
            <span className="text-xs text-secondary mt-0.5 block">{complaint.urgency}</span>
          </div>
        </div>

        <p className="text-sm text-on-surface leading-relaxed bg-surface-container/60 p-5 rounded-2xl border border-surface-container-highest">
          {complaint.description}
        </p>

        {/* Metadata Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block">Citizen Complainant</span>
            <span className="font-bold text-on-surface text-xs">{complaint.citizen || 'Rajesh Kumar'}</span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block">Nodal Department</span>
            <span className="font-bold text-on-surface text-xs truncate block">{complaint.department || 'Drinking Water & Sanitation Dept (DWSD)'}</span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block">Jurisdiction</span>
            <span className="font-bold text-on-surface text-xs truncate block">
              {complaint.location?.district}, {complaint.location?.state}
            </span>
          </div>
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest">
            <span className="text-secondary block">Registered On</span>
            <span className="font-bold text-on-surface text-xs font-code-num">
              {complaint.date || complaint.createdAt?.split('T')[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: 6-Step Audit Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-surface-container-highest pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                  {t('timeline_title', 'Real-Time Grievance Remediation Audit Trail')}
                </h2>
                <p className="text-xs text-secondary">
                  Immutable milestone logs with multi-stakeholder timestamping
                </p>
              </div>
              <span className="material-symbols-outlined text-2xl text-primary">history_edu</span>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === 'done';
                const isCurrent = step.status === 'current';

                let dotColor = 'bg-surface-container text-secondary border-surface-container-highest';
                if (isDone) {
                  dotColor = 'bg-[#003824] text-[#4edea3] border-[#00b07a]';
                } else if (isCurrent) {
                  dotColor = 'bg-primary-container text-white border-primary ring-4 ring-primary-container/20';
                }

                return (
                  <div key={idx} className="relative group">
                    {/* Step Icon / Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${dotColor}`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="bg-surface-container p-4 sm:p-5 rounded-2xl border border-surface-container-highest space-y-1 group-hover:border-primary-container/40 transition-colors">
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

          {/* Evidence Gallery */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Geotagged Evidence & Lab Media</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container rounded-2xl p-4 border border-surface-container-highest space-y-3">
                <div className="h-36 bg-surface-container-highest/40 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <span className="material-symbols-outlined text-4xl text-primary opacity-60">
                    water_drop
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded font-mono">
                    23.3629° N, 85.3372° E
                  </span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-xs truncate">water_turbidity_sample_1.jpg</p>
                  <p className="text-[11px] text-secondary">2.1 MB • Geotagged & EXIF Verified</p>
                </div>
              </div>

              <div className="bg-surface-container rounded-2xl p-4 border border-surface-container-highest space-y-3">
                <div className="h-36 bg-surface-container-highest/40 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <span className="material-symbols-outlined text-4xl text-secondary opacity-60">
                    picture_as_pdf
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded font-mono">
                    Ranchi State Water Testing Lab
                  </span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-xs truncate">local_clinic_lab_report.pdf</p>
                  <p className="text-[11px] text-secondary">1.4 MB • Certified Water Testing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Computer Vision & University Assignment */}
        <div className="space-y-6">
          {/* AI Intelligence Card */}
          <div className="bg-surface-container-low border border-primary-container/40 rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm">AI Triage Intelligence</h3>
                <p className="text-xs text-secondary">Computer Vision & NLP Severity Engine</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Confidence Score</span>
                <span className="font-bold font-code-num text-primary">
                  {Math.round((complaint.aiAnalysis?.confidence || 0.96) * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Detected Severity</span>
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-error-container/40 text-error border border-error/50">
                  {complaint.aiAnalysis?.severity || 'Critical'}
                </span>
              </div>

              <div>
                <span className="text-xs text-secondary block mb-1.5">Computer Vision Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {(complaint.aiAnalysis?.tags || ['biofilm', 'rust_contamination', 'pipeline_fracture']).map(
                    (tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-surface-container text-secondary text-xs rounded-md border border-surface-container-highest font-mono"
                      >
                        #{tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-highest space-y-1">
                <span className="text-xs font-bold text-primary block">Suggested Remediation:</span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {complaint.aiAnalysis?.suggestedAction ||
                    'Immediate pipeline isolation and deployment of UV flocculation filters.'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic & Industry Matching */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-tertiary text-2xl">school</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm">Innovation Hub Assignment</h3>
                <p className="text-xs text-secondary">Jharkhand Innovation Capstone Match</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-surface-container rounded-2xl border border-surface-container-highest space-y-1">
                <span className="text-xs text-secondary block">Assigned University</span>
                <p className="font-bold text-on-surface text-xs sm:text-sm">
                  {complaint.assignedUniversity || 'Birla Institute of Technology, Mesra'}
                </p>
                <span className="text-[11px] text-tertiary block font-semibold">
                  Team: HydroClean Capstone Innovators
                </span>
              </div>

              <div className="p-3.5 bg-surface-container rounded-2xl border border-surface-container-highest space-y-1">
                <span className="text-xs text-secondary block">CSR Industry Partner</span>
                <p className="font-bold text-on-surface text-xs sm:text-sm">
                  {complaint.assignedIndustry || 'EcoSolve Technologies Pvt Ltd'}
                </p>
                <span className="text-[11px] text-[#4edea3] block font-semibold">
                  Co-funding Grant: ₹ 2,50,000 Allocated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetail;
