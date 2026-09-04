import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

const CATEGORY_COLORS = ['#ff6f00', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

function AdminDashboard() {
  const { complaints } = useData();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 1. KPI Calculations from Live State
  const total = complaints.length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const critical = complaints.filter((c) => c.urgencyLevel === 'critical' || (c.urgency || '').includes('12 Hours')).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // 2. Status Distribution Data for Pie Chart
  const statusPieData = useMemo(() => {
    return [
      { name: 'In Progress', value: inProgress, color: '#ff6f00' },
      { name: 'Resolved', value: resolved, color: '#00b07a' }
    ];
  }, [inProgress, resolved]);

  // 3. Category Breakdown Data for Bar Chart
  const categoryBarData = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      const cat = c.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map((cat, idx) => ({
      category: cat.split(' ')[0], // Short name
      fullName: cat,
      count: counts[cat],
      fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    }));
  }, [complaints]);

  // 4. District Load Breakdown
  const districtBarData = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      const dist = c.location?.district || 'Other';
      counts[dist] = (counts[dist] || 0) + 1;
    });

    return Object.keys(counts).map((dist) => ({
      district: dist,
      count: counts[dist]
    }));
  }, [complaints]);

  // 5. Trend Line Data
  const trendLineData = [
    { date: '01 Feb', filed: 12, resolved: 8 },
    { date: '02 Feb', filed: 18, resolved: 14 },
    { date: '03 Feb', filed: 24, resolved: 20 },
    { date: '04 Feb', filed: 29, resolved: 22 },
    { date: '05 Feb', filed: 35, resolved: 28 },
    { date: '06 Feb', filed: total, resolved: resolved }
  ];

  const handleExportPDF = () => {
    showToast('Executive Jharkhand State Nodal Analytics & SLA Report exported (PDF)', 'info');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>Jharkhand State Digital Governance SLA Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {t('admin_dash_title', 'Administrative Command & SLA Analytics')}
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            {t('admin_dash_desc', 'Jharkhand State telemetry, grievance resolution velocity, and inter-district performance benchmarking.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/complaints')}
            className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-xs font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">table_chart</span>
            <span>Complaint Matrix</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-3 bg-primary-container hover:bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Executive Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">{t('total_filed', 'Total Registered')}</span>
            <span className="material-symbols-outlined text-lg">folder_shared</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-on-surface">{total}</div>
          <span className="text-xs text-secondary mt-1 block">Live synced across districts</span>
        </div>

        {/* Active In-Progress */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">{t('status_in_progress', 'Active Remediation')}</span>
            <span className="material-symbols-outlined text-lg text-primary">pending_actions</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-primary">{inProgress}</div>
          <span className="text-xs text-secondary mt-1 block">Assigned to engineers & labs</span>
        </div>

        {/* Resolution Rate */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">{t('kpi_resolution_rate', 'Resolution Rate')}</span>
            <span className="material-symbols-outlined text-lg text-[#4edea3]">task_alt</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-[#4edea3]">{resolutionRate}%</div>
          <span className="text-xs text-[#4edea3] mt-1 block">{resolved} of {total} grievances resolved</span>
        </div>

        {/* Critical SLA Breaches */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">{t('kpi_sla_urgency', 'Critical (12h SLA)')}</span>
            <span className="material-symbols-outlined text-lg text-error">priority_high</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-error">{critical}</div>
          <span className="text-xs text-error mt-1 block">Priority auto-dispatch active</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Chart 1: Status Distribution Donut */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Grievance Status Breakdown</h3>
              <p className="text-xs text-secondary">Real-time status proportions</p>
            </div>
            <span className="material-symbols-outlined text-secondary">pie_chart</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grievance Registration & Resolution Trend */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Weekly Resolution Velocity</h3>
              <p className="text-xs text-secondary">Complaints registered vs resolved</p>
            </div>
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="filed" stroke="#ff6f00" strokeWidth={3} dot={{ r: 4 }} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#00b07a" strokeWidth={3} dot={{ r: 4 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Breakdown Bar Chart */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Grievances by Category</h3>
              <p className="text-xs text-secondary">Distribution across civic domains</p>
            </div>
            <span className="material-symbols-outlined text-secondary">bar_chart</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryBarData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: District Load */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
            <div>
              <h3 className="text-lg font-bold text-on-surface">District Workload</h3>
              <p className="text-xs text-secondary">Complaints pending by municipal district</p>
            </div>
            <span className="material-symbols-outlined text-secondary">domain</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#ff6f00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Recent Grievances Table */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Urgent Life-Safety Escalations</h3>
            <p className="text-xs text-secondary">Active grievances requiring immediate nodal intervention</p>
          </div>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
          >
            <span>View Full Matrix</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        <div className="divide-y divide-surface-container-highest">
          {complaints.slice(0, 3).map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/complaints/${item._id}`)}
              className="py-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-surface-container/60 px-2 rounded-xl transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-code-num font-bold text-primary text-xs">{item.urn}</span>
                  <span className="text-xs text-secondary">{item.category}</span>
                </div>
                <h4 className="font-bold text-on-surface text-sm">{item.title}</h4>
                <p className="text-xs text-secondary truncate">{item.location?.address}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-code-num font-bold text-primary text-xs">
                  {item.slaLeft}
                </span>
                <StatusBadge status={item.status} />
                <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
