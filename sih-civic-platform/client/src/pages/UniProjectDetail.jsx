import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { projectsApi, industryApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import CommentsSection from '../components/CommentsSection';

export default function UniProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Industry Partners for Invitation
  const [industryPartners, setIndustryPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [grantAmount, setGrantAmount] = useState('₹ 3,50,000');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Team Member Modal State
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRoll, setMemberRoll] = useState('');
  const [memberDept, setMemberDept] = useState('Civil & Environmental Engineering');
  const [memberRole, setMemberRole] = useState('Lead Researcher');
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getProjectById(id);
      if (res && res.success && res.project) {
        setProject(res.complaintId ? res.project : { ...res.project, complaintId: res.project.complaintId || {} });
      } else {
        throw new Error(res?.message || 'Project not found');
      }

      // Fetch industry partners for invite dropdown
      try {
        const indRes = await industryApi.getPartners();
        if (indRes && indRes.success) {
          setIndustryPartners(indRes.industryPartners || []);
          if (indRes.industryPartners?.length > 0) {
            setSelectedPartnerId(indRes.industryPartners[0]._id);
          }
        }
      } catch (_indErr) {}
    } catch (err) {
      console.error('[UniProjectDetail] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Milestone Status Toggle
  const handleMilestoneToggle = async (milestoneId, currentStatus) => {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done';

    try {
      const res = await projectsApi.updateMilestones(project._id, {
        action: 'update',
        milestoneId,
        milestone: { status: nextStatus }
      });

      if (res && res.success && res.project) {
        setProject(res.project);
        showToast(`Milestone status updated to: ${nextStatus.toUpperCase()}`, 'success');
        if (res.project.status === 'completed') {
          showToast('All milestones completed! Project marked COMPLETED and civic grievance marked RESOLVED.', 'success');
        }
      }
    } catch (err) {
      console.error('[UniProjectDetail] Milestone toggle error:', err);
      showToast(`Milestone update failed: ${err.message}`, 'error');
    }
  };

  // Add Team Member
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    setIsUpdatingTeam(true);
    try {
      // Encode details in name string to preserve roll/dept/subRole
      const displayName = `${memberName.trim()} (${memberRole} - ${memberRoll}, ${memberDept})`;
      const res = await projectsApi.updateTeam(project._id, {
        action: 'add',
        member: {
          name: displayName,
          role: 'student'
        }
      });

      if (res && res.success) {
        setProject((prev) => ({ ...prev, team: res.team }));
        setTeamModalOpen(false);
        setMemberName('');
        setMemberRoll('');
        showToast('Student researcher added to innovation team', 'success');
      }
    } catch (err) {
      showToast(`Failed to add team member: ${err.message}`, 'error');
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  // Remove Team Member
  const handleRemoveTeamMember = async (memberId) => {
    try {
      const res = await projectsApi.updateTeam(project._id, {
        action: 'remove',
        memberId
      });
      if (res && res.success) {
        setProject((prev) => ({ ...prev, team: res.team }));
        showToast('Team member removed from project roster', 'info');
      }
    } catch (err) {
      showToast(`Failed to remove member: ${err.message}`, 'error');
    }
  };

  // Invite Industry Partner
  const handleInviteIndustry = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      showToast('Please select a registered industry partner', 'error');
      return;
    }

    setIsInviting(true);
    try {
      const res = await projectsApi.inviteIndustry(project._id, selectedPartnerId);
      if (res && res.success) {
        showToast('CSR co-funding invitation dispatched to corporate partner', 'success');
        fetchProjectData();
      }
    } catch (err) {
      showToast(`Failed to send invitation: ${err.message}`, 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const milestones = project?.milestones || [];

  // 1. Overall Milestone Donut Data
  const { completedCount, pendingCount, totalMilestones, completionPct } = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'done').length;
    const pending = total - completed;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      completedCount: completed,
      pendingCount: pending,
      totalMilestones: total,
      completionPct: pct
    };
  }, [milestones]);

  const milestonePieData = useMemo(() => {
    return [
      { name: 'Completed', value: completedCount, color: '#00b07a' },
      { name: 'Pending Execution', value: pendingCount, color: '#f59e0b' }
    ].filter((d) => d.value > 0);
  }, [completedCount, pendingCount]);

  // 2. Stage-by-Stage Progress Bar Data
  const stageBarData = useMemo(() => {
    return milestones.map((m, idx) => ({
      stage: `M${idx + 1}`,
      title: m.title.length > 22 ? `${m.title.slice(0, 20)}...` : m.title,
      progress: m.status === 'done' ? 100 : 35,
      status: m.status === 'done' ? 'Completed' : 'Pending'
    }));
  }, [milestones]);

  // 3. Delivery Velocity vs. Target Timeline Data
  const velocityData = useMemo(() => {
    return [
      { sprint: 'Sprint 1 (Survey)', target: 25, actual: completedCount >= 1 ? 25 : 10 },
      { sprint: 'Sprint 2 (Prototype)', target: 50, actual: completedCount >= 2 ? 50 : 25 },
      { sprint: 'Sprint 3 (Field Testing)', target: 75, actual: completedCount >= 3 ? 75 : 40 },
      { sprint: 'Sprint 4 (Handover)', target: 100, actual: completedCount >= 3 && project?.status === 'completed' ? 100 : 60 }
    ];
  }, [completedCount, project?.status]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-secondary">Loading applied R&D workspace & milestone telemetry...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-12 bg-surface-container-low border border-surface-container-highest rounded-2xl text-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-error">science</span>
        <h3 className="text-lg font-bold text-on-surface">Project Workspace Not Found</h3>
        <p className="text-xs text-secondary">{error || 'This project dossier is unavailable.'}</p>
        <button
          onClick={() => navigate('/university/challenges')}
          className="px-5 py-2.5 bg-tertiary-container text-white text-xs font-bold rounded-xl"
        >
          Return to Challenges
        </button>
      </div>
    );
  }

  const complaint = project.complaintId || {};
  const universityData = project.universityId || {};
  const industryData = project.industryPartnerId;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/university/challenges')}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Challenges</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">R&D Status:</span>
          <StatusBadge status={project.status} size="md" />
        </div>
      </div>

      {/* Project Master Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary border border-tertiary-container/30 text-xs font-bold rounded-lg font-mono">
                PROJECT-{project._id.slice(-6).toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-surface-container text-secondary text-xs rounded-lg border border-surface-container-highest capitalize">
                {complaint.category || 'Civil Innovation'}
              </span>
              <span className="px-3 py-1 bg-[#003824] text-[#4edea3] text-xs font-bold rounded-lg border border-[#00b07a]">
                {completionPct}% Complete
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight leading-tight">
              {complaint.title || 'Municipal Applied Innovation Workspace'}
            </h1>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest min-w-[200px] text-left sm:text-right">
            <span className="text-xs text-secondary block font-medium">Leading Institution</span>
            <span className="text-sm sm:text-base font-bold text-on-surface block truncate">
              {universityData.name || 'BIT Mesra, Ranchi'}
            </span>
            <span className="text-xs text-tertiary mt-0.5 block font-semibold">
              PI: {user?.name || 'Anita Sharma'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-on-surface leading-relaxed bg-surface-container/60 p-5 rounded-2xl border border-surface-container-highest">
          <strong>Underlying Problem Statement:</strong> {complaint.description || 'Verified citizen civic grievance.'}
        </p>
      </div>

      {/* 3 Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut Gauge */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-tertiary uppercase tracking-wider block">
              1. Completion Gauge
            </span>
            <h4 className="text-sm font-bold text-on-surface mt-1">
              Milestones Execution Donut
            </h4>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={milestonePieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {milestonePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-code-num text-on-surface">{completionPct}%</span>
              <span className="text-[10px] text-secondary">Complete</span>
            </div>
          </div>

          <div className="flex justify-around text-xs text-secondary border-t border-surface-container-highest pt-2">
            <span>Done: <strong className="text-[#4edea3]">{completedCount}</strong></span>
            <span>Pending: <strong className="text-amber-400">{pendingCount}</strong></span>
            <span>Total: <strong className="text-on-surface">{totalMilestones}</strong></span>
          </div>
        </div>

        {/* Chart 2: Stage-by-Stage Horizontal Bar Chart */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              2. Stage Breakdown
            </span>
            <h4 className="text-sm font-bold text-on-surface mt-1">
              Stage-by-Stage Completion Bar
            </h4>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94a3b8" />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" />
                <RechartsTooltip />
                <Bar dataKey="progress" fill="#ff6f00" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-secondary text-center border-t border-surface-container-highest pt-2">
            Progress calculated per official state deliverables
          </div>
        </div>

        {/* Chart 3: Delivery Velocity vs. Target Timeline */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#4edea3] uppercase tracking-wider block">
              3. Delivery Velocity
            </span>
            <h4 className="text-sm font-bold text-on-surface mt-1">
              Target vs. Actual Burnup Velocity
            </h4>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ left: -15, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="sprint" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} unit="%" />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="4 4" name="Target" />
                <Line type="monotone" dataKey="actual" stroke="#00b07a" strokeWidth={2.5} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-secondary text-center border-t border-surface-container-highest pt-2">
            Measured against 90-day Jharkhand state SLA window
          </div>
        </div>
      </div>

      {/* Main Workspace Columns: Milestones & Team vs. Industry Invitation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Milestones & Student Team Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Milestones */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-surface-container-highest pb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  R&D Milestones & Prototype Execution
                </h3>
                <p className="text-xs text-secondary">
                  Toggle milestone checkboxes to persist progress to the state database
                </p>
              </div>
              <span className="material-symbols-outlined text-primary text-2xl">checklist</span>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const isDone = m.status === 'done';
                return (
                  <div
                    key={m._id || idx}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isDone
                        ? 'bg-[#003824]/20 border-[#00b07a]/50'
                        : 'bg-surface-container border-surface-container-highest'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleMilestoneToggle(m._id, m.status)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#00b07a] border-[#00b07a] text-white shadow-sm'
                            : 'border-secondary hover:border-primary text-transparent'
                        }`}
                        title="Toggle Milestone Completion"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-secondary font-mono">
                            Milestone #{idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isDone
                                ? 'bg-[#00b07a]/20 text-[#4edea3]'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isDone ? 'Completed' : 'In Progress / Pending'}
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-secondary' : 'text-on-surface'}`}>
                          {m.title}
                        </h4>
                        {m.dueDate && (
                          <span className="text-[11px] text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">calendar_today</span>
                            <span>Target Date: {new Date(m.dueDate).toLocaleDateString('en-IN')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMilestoneToggle(m._id, m.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isDone
                          ? 'bg-surface-container hover:bg-surface-container-high text-secondary border border-surface-container-highest'
                          : 'bg-primary-container hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      {isDone ? 'Mark Pending' : 'Mark as Done'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Student Team Builder */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-surface-container-highest pb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  Student Research Team Roster
                </h3>
                <p className="text-xs text-secondary">
                  Capstone developers and student researchers linked to this project
                </p>
              </div>

              <button
                onClick={() => setTeamModalOpen(true)}
                className="px-4 py-2 bg-tertiary-container hover:bg-[#009b6a] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Add Student Member</span>
              </button>
            </div>

            {project.team && project.team.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.team.map((member) => (
                  <div
                    key={member._id}
                    className="p-4 bg-surface-container rounded-2xl border border-surface-container-highest flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-xl bg-tertiary-container/20 text-tertiary border border-tertiary-container/30 flex items-center justify-center font-bold text-sm shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <strong className="text-on-surface block truncate">{member.name}</strong>
                        <span className="text-secondary text-[11px] capitalize">{member.role?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveTeamMember(member._id)}
                      className="p-1.5 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      title="Remove Member"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-surface-container rounded-2xl text-center space-y-2 border border-surface-container-highest">
                <span className="material-symbols-outlined text-3xl text-secondary opacity-50">group</span>
                <p className="text-xs text-secondary">No student researchers registered on this team yet.</p>
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  + Add First Student Member
                </button>
              </div>
            )}
          </div>

          {/* Multi-Stakeholder Comments Section */}
          <CommentsSection entityId={project._id} entityType="project" />
        </div>

        {/* Right 1 Col: Industry Co-Funding & Partners */}
        <div className="space-y-6">
          {/* Active Industry Partner Card */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-primary text-2xl">corporate_fare</span>
              <div>
                <h4 className="font-bold text-on-surface text-sm">Industry Co-Funding Status</h4>
                <p className="text-xs text-secondary">CSR Capital Allocation (MCA Section 135)</p>
              </div>
            </div>

            {industryData ? (
              <div className="p-4 bg-surface-container rounded-2xl border border-[#00b07a]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4edea3]">Co-Funding Partner Active</span>
                  <span className="px-2 py-0.5 bg-[#003824] text-[#4edea3] text-[10px] font-bold rounded-full border border-[#00b07a]">
                    MoU Approved
                  </span>
                </div>
                <h5 className="font-bold text-on-surface text-sm">{industryData.name || 'EcoSolve Technologies'}</h5>
                <p className="text-xs text-secondary">{industryData.contactEmail || 'contact@ecosolve.in'}</p>
                <div className="pt-2 border-t border-surface-container-highest flex justify-between text-xs">
                  <span className="text-secondary">Committed CSR Grant:</span>
                  <strong className="text-primary font-mono font-bold">₹ 2,50,000</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteIndustry} className="space-y-4">
                <p className="text-xs text-secondary leading-relaxed">
                  Invite registered corporate CSR sponsors to inspect this project proposal and provide seed grant co-funding.
                </p>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                    Select Industry Partner *
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-on-surface focus:border-primary outline-none"
                  >
                    {industryPartners.map((partner) => (
                      <option key={partner._id} value={partner._id}>
                        {partner.name} ({partner.type || 'Corporate'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                    Requested Grant Allocation
                  </label>
                  <input
                    type="text"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2 text-xs text-on-surface font-mono focus:border-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isInviting || industryPartners.length === 0}
                  className="w-full py-3 bg-primary-container hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    <span>Dispatching Invitation...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">handshake</span>
                      <span>Invite CSR Partner</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Dossier Quick Link */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
              Linked Civic Dossier
            </h4>
            <p className="text-xs text-on-surface font-bold truncate">
              {complaint.title || 'Civic Problem Statement'}
            </p>
            <button
              onClick={() => navigate(`/complaints/${complaint._id}`)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1 pt-1"
            >
              <span>Inspect Citizen Dossier</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Team Member Modal */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
              <h3 className="text-base font-bold text-on-surface">Add Student Researcher</h3>
              <button
                onClick={() => setTeamModalOpen(false)}
                className="p-1 text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary uppercase tracking-wider mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Rohan Gupta"
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-2.5 text-on-surface focus:border-tertiary-container outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary uppercase tracking-wider mb-1">
                  Roll / Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={memberRoll}
                  onChange={(e) => setMemberRoll(e.target.value)}
                  placeholder="e.g. BTECH/CIVIL/2022/045"
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-2.5 text-on-surface font-mono focus:border-tertiary-container outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary uppercase tracking-wider mb-1">
                  Academic Department *
                </label>
                <input
                  type="text"
                  value={memberDept}
                  onChange={(e) => setMemberDept(e.target.value)}
                  placeholder="e.g. Environmental Engineering"
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-2.5 text-on-surface focus:border-tertiary-container outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary uppercase tracking-wider mb-1">
                  Role in Project
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-2.5 text-on-surface focus:border-tertiary-container outline-none"
                >
                  <option value="Lead Developer">Lead Developer</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Hardware / IoT Specialist">Hardware / IoT Specialist</option>
                  <option value="Field Surveyor">Field Surveyor</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 bg-surface-container border border-surface-container-highest rounded-xl text-secondary hover:text-on-surface font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTeam}
                  className="px-5 py-2 bg-tertiary-container hover:bg-[#009b6a] text-white font-bold rounded-xl shadow"
                >
                  {isUpdatingTeam ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
