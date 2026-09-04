import React, { useMemo } from 'react';
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
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

function UniProjectDetail() {
  const { id } = useParams();
  const { projects, updateMilestone } = useData();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const project = projects.find((p) => p._id === id) || projects[0];

  if (!project) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-headline-md font-bold text-on-surface">Innovation Project Not Found</h2>
        <button
          onClick={() => navigate('/university/challenges')}
          className="px-4 py-2 bg-tertiary-container text-white rounded-xl font-bold"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  const milestones = project.milestones || [];

  // Toggle milestone status between completed and in_progress / pending
  const handleMilestoneToggle = (milestoneId, currentStatus) => {
    let nextStatus = 'completed';
    if (currentStatus === 'completed') {
      nextStatus = 'in_progress';
    } else if (currentStatus === 'in_progress') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'in_progress';
    }

    updateMilestone(project._id, milestoneId, nextStatus);
    showToast(`Milestone updated to: ${nextStatus.replace('_', ' ').toUpperCase()}`, 'success');
  };

  // 1. Overall Milestone Progress Data
  const { completedCount, inProgressCount, pendingCount, totalMilestones, completionPercentage } = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'completed' || m.status === 'done').length;
    const inProg = milestones.filter((m) => m.status === 'in_progress' || m.status === 'active').length;
    const pending = milestones.filter((m) => m.status === 'pending' || !m.status).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      completedCount: completed,
      inProgressCount: inProg,
      pendingCount: pending,
      totalMilestones: total,
      completionPercentage: pct
    };
  }, [milestones]);

  const milestonePieData = useMemo(() => {
    const data = [
      { name: 'Completed', value: completedCount, color: '#00b07a' },
      { name: 'In Progress', value: inProgressCount, color: '#38bdf8' },
      { name: 'Pending', value: pendingCount, color: '#f59e0b' }
    ];
    // Return slices that have values, or a fallback empty slice if 0
    return data.filter((d) => d.value > 0);
  }, [completedCount, inProgressCount, pendingCount]);

  // 2. Stage-by-Stage Progress Data (Bar Chart)
  const stageBarData = useMemo(() => {
    return milestones.map((m, idx) => {
      const isCompleted = m.status === 'completed' || m.status === 'done';
      const isInProgress = m.status === 'in_progress' || m.status === 'active';
      const progressVal = isCompleted ? 100 : isInProgress ? 60 : 0;
      const shortTitle = m.title.length > 20 ? `${m.title.slice(0, 18)}...` : m.title;

      return {
        stage: `M${idx + 1}: ${shortTitle}`,
        fullTitle: m.title,
        status: isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending',
        progress: progressVal,
        color: isCompleted ? '#00b07a' : isInProgress ? '#38bdf8' : '#64748b'
      };
    });
  }, [milestones]);

  // 3. Timeline Horizon Data (Progression Chart)
  const timelineProgressData = useMemo(() => {
    return milestones.map((m, idx) => {
      const isCompleted = m.status === 'completed' || m.status === 'done';
      const isInProgress = m.status === 'in_progress' || m.status === 'active';
      const actualPct = isCompleted ? 100 : isInProgress ? 60 : 0;
      const targetPct = Math.round(((idx + 1) / milestones.length) * 100);

      return {
        date: m.date || `M${idx + 1}`,
        milestone: `M${idx + 1}`,
        title: m.title,
        Target: targetPct,
        Actual: actualPct
      };
    });
  }, [milestones]);

  const team = project.team || [
    { name: 'Dr. Anita Sharma', role: 'Principal Investigator (PI)', dept: 'Dept of Environmental Engineering' },
    { name: 'Rohan Verma', role: 'Student Capstone Lead', dept: 'B.Tech Chemical Engg' },
    { name: 'Pooja Iyer', role: 'Embedded IoT Researcher', dept: 'B.Tech ECE' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={() => navigate('/university/challenges')}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Challenges</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-tertiary-container/20 text-tertiary border border-tertiary-container/40 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span>Jharkhand Innovation Track #2026</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>On Track • Active Delivery</span>
          </span>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary border border-tertiary-container/30 text-xs font-bold rounded-lg">
              {project.domain || 'Clean Tech'}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-secondary max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest min-w-[220px]">
            <span className="text-xs text-secondary block font-medium">Allocated Innovation Grant</span>
            <span className="text-xl sm:text-2xl font-bold font-code-num text-[#4edea3] block">
              {project.grantAmount || '₹ 2,50,000'}
            </span>
            <span className="text-xs text-secondary mt-0.5 block">Co-funded by EcoSolve CSR</span>
          </div>
        </div>
      </div>

      {/* VISUALIZATION SECTION: Project Milestone Dashboard */}
      {milestones.length === 0 ? (
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-8 text-center text-secondary">
          No milestone data available for this innovation project.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Heading */}
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-2xl">monitoring</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Milestone Telemetry & Delivery Analytics
              </h2>
              <p className="text-xs text-secondary">
                Live visualization of project milestones, execution velocity, and stage progress
              </p>
            </div>
          </div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Visualization 1: Overall Milestone Progress Donut */}
            <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Overall Completion</h3>
                  <p className="text-[11px] text-secondary">Status distribution across deliverables</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-lg">donut_large</span>
              </div>

              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={milestonePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {milestonePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0c1322',
                        borderColor: '#1e293b',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge Indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold font-code-num text-on-surface">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] text-secondary uppercase font-semibold">Done</span>
                </div>
              </div>

              {/* Dynamic Counters */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container-highest text-center text-xs">
                <div className="bg-surface-container p-2 rounded-xl">
                  <span className="text-emerald-400 font-bold block font-code-num">{completedCount}</span>
                  <span className="text-[10px] text-secondary">Completed</span>
                </div>
                <div className="bg-surface-container p-2 rounded-xl">
                  <span className="text-sky-400 font-bold block font-code-num">{inProgressCount}</span>
                  <span className="text-[10px] text-secondary">In Progress</span>
                </div>
                <div className="bg-surface-container p-2 rounded-xl">
                  <span className="text-amber-400 font-bold block font-code-num">{pendingCount}</span>
                  <span className="text-[10px] text-secondary">Pending</span>
                </div>
              </div>
            </div>

            {/* Visualization 2: Milestone Progress by Stage (Bar Chart) */}
            <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Progress by Stage</h3>
                  <p className="text-[11px] text-secondary">Stage-wise percentage completion</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-lg">bar_chart</span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageBarData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      width={70}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0c1322',
                        borderColor: '#1e293b',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                      formatter={(val, name, item) => [`${val}% (${item.payload.status})`, 'Progress']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                    />
                    <Bar dataKey="progress" radius={[0, 6, 6, 0]}>
                      {stageBarData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-secondary text-center pt-2 border-t border-surface-container-highest">
                <span>{completedCount} of {totalMilestones} stages formally audited</span>
              </div>
            </div>

            {/* Visualization 3: Timeline / Schedule Velocity (Line Chart) */}
            <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Timeline & Schedule</h3>
                  <p className="text-[11px] text-secondary">Target vs Actual milestone execution</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-lg">timeline</span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineProgressData}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} unit="%" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0c1322',
                        borderColor: '#1e293b',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="Target"
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Actual"
                      stroke="#00b07a"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-secondary text-center pt-2 border-t border-surface-container-highest">
                <span>Final deployment target: {milestones[milestones.length - 1]?.date || 'Q2 2026'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Milestone Deliverables Checklist & Interactive Audit */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-surface-container-highest pb-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                  Milestone Deliverables & Interactive Audit Log
                </h2>
                <p className="text-xs text-secondary">
                  Click any milestone below to toggle completion status and update live telemetry
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-surface-container rounded-lg border border-surface-container-highest text-secondary">
                {completedCount}/{totalMilestones} Audited
              </span>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const isCompleted = m.status === 'completed' || m.status === 'done';
                const isInProgress = m.status === 'in_progress' || m.status === 'active';

                return (
                  <div
                    key={m._id || idx}
                    onClick={() => handleMilestoneToggle(m._id, m.status)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-sm hover:shadow-md ${
                      isCompleted
                        ? 'bg-[#003824]/25 border-[#00b07a]/40 hover:bg-[#003824]/35'
                        : isInProgress
                        ? 'bg-sky-950/30 border-sky-500/40 hover:bg-sky-950/40'
                        : 'bg-surface-container border-surface-container-highest hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 shrink-0">
                        <span
                          className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${
                            isCompleted
                              ? 'text-[#4edea3]'
                              : isInProgress
                              ? 'text-sky-400'
                              : 'text-secondary'
                          }`}
                        >
                          {isCompleted
                            ? 'check_circle'
                            : isInProgress
                            ? 'radio_button_checked'
                            : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-code-num font-bold text-secondary">
                            Stage {idx + 1}
                          </span>
                          <h4 className="font-bold text-on-surface text-sm sm:text-base">
                            {m.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap shrink-0 space-y-1.5">
                      <StatusBadge status={m.status} size="md" />
                      <span className="text-[11px] text-secondary font-code-num block">
                        {m.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team and CSR Partner info */}
        <div className="space-y-6">
          {/* Team Info Card */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-tertiary text-xl">group</span>
              <h3 className="font-bold text-on-surface text-sm">R&D Capstone Team</h3>
            </div>
            <div className="space-y-3">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="p-3 bg-surface-container rounded-xl border border-surface-container-highest space-y-0.5"
                >
                  <p className="font-bold text-on-surface text-xs sm:text-sm">{member.name}</p>
                  <p className="text-xs text-tertiary font-medium">{member.role}</p>
                  <p className="text-[11px] text-secondary">{member.dept}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CSR Sponsor Card */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-primary text-xl">handshake</span>
              <h3 className="font-bold text-on-surface text-sm">Industry CSR Sponsor</h3>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-surface-container-highest space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">corporate_fare</span>
                <span className="font-bold text-on-surface text-xs sm:text-sm">
                  {project.industryPartnerName || 'EcoSolve Technologies Pvt Ltd'}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Grant tranche #1 disbursed (₹ 1,00,000). Tranche #2 unlocked upon milestone completion sign-off.
              </p>
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
              <h3 className="font-bold text-on-surface text-sm">Jharkhand Higher Ed Accreditation</h3>
            </div>
            <div className="text-xs text-secondary space-y-2">
              <p>
                Verified under Department of Higher & Technical Education, Government of Jharkhand.
              </p>
              <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-xl border border-surface-container-highest font-mono text-[11px]">
                <span>AISHE Code</span>
                <span className="font-bold text-on-surface">U-0120</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniProjectDetail;
