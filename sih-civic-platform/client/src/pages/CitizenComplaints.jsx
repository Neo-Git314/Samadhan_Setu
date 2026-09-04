import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/StatusBadge';

function CitizenComplaints() {
  const { complaints } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stats
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const criticalCount = complaints.filter((c) => (c.urgencyLevel === 'critical' || (c.urgency || '').includes('Critical'))).length;

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.urn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'IN_PROGRESS'
          ? c.status === 'In Progress'
          : statusFilter === 'RESOLVED'
          ? c.status === 'Resolved'
          : statusFilter === 'CRITICAL'
          ? (c.urgencyLevel === 'critical' || (c.urgency || '').includes('Critical'))
          : true;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Government of Jharkhand — Citizen Grievance Redressal Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Citizen Grievance Redressal Command
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            Monitor municipal grievances across Jharkhand districts, inspect AI severity verification, and track real-time SLA remediation.
          </p>
        </div>

        <button
          onClick={() => navigate('/citizen/submit')}
          className="px-6 py-3.5 bg-primary-container hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md hover:shadow-orange-500/20 transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Register Grievance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Filed */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'ALL'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Total Grievances</span>
            <span className="material-symbols-outlined text-lg">folder_open</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-on-surface">{totalCount}</div>
          <div className="text-xs text-secondary mt-1 flex items-center gap-1">
            <span className="text-primary font-medium">100%</span> tracked via URN
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Active Remediation</span>
            <span className="material-symbols-outlined text-lg text-primary">pending_actions</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-primary">{inProgressCount}</div>
          <div className="text-xs text-secondary mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping"></span>
            Within active SLA
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'RESOLVED'
              ? 'bg-surface-container-high border-[#00b07a] ring-2 ring-[#00b07a]/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Resolved & Signed</span>
            <span className="material-symbols-outlined text-lg text-[#4edea3]">task_alt</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-[#4edea3]">{resolvedCount}</div>
          <div className="text-xs text-secondary mt-1 flex items-center gap-1 text-[#4edea3]">
            Citizen OTP verified
          </div>
        </div>

        {/* Critical Life Safety */}
        <div
          onClick={() => setStatusFilter('CRITICAL')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'CRITICAL'
              ? 'bg-surface-container-high border-error ring-2 ring-error/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Critical (12h SLA)</span>
            <span className="material-symbols-outlined text-lg text-error">warning</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-error">{criticalCount}</div>
          <div className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
            Auto-escalated to Officer
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by URN, keyword, department, or district (Ranchi, Dhanbad, Jamshedpur)..."
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:border-primary-container outline-none transition-all placeholder:text-secondary/70"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'RESOLVED', label: 'Resolved' },
            { key: 'CRITICAL', label: 'Critical' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-primary-container text-white font-bold shadow-sm'
                  : 'bg-surface-container text-secondary hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-secondary">manage_search</span>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-on-surface">No Grievances Found</h3>
              <p className="text-sm text-secondary">
                No complaints matched your search filter criteria.
              </p>
            </div>
          </div>
        ) : (
          filteredComplaints.map((item) => {
            const isCritical = item.urgencyLevel === 'critical' || (item.urgency || '').includes('12 Hours');
            return (
              <div
                key={item._id || item.urn}
                onClick={() => navigate(`/complaints/${item._id || item.urn}`)}
                className="group cursor-pointer bg-surface-container-low hover:bg-surface-container border border-surface-container-highest hover:border-primary-container/60 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Card Top Row */}
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 bg-surface-container-high text-primary border border-primary-container/30 rounded-lg text-xs font-code-num font-bold">
                      {item.urn}
                    </span>
                    <span className="px-2.5 py-0.5 bg-surface-container text-secondary text-xs font-medium rounded-md border border-surface-container-highest">
                      {item.category}
                    </span>
                    {isCritical && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/40 text-error border border-error/50 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                        12h Critical SLA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} size="lg" />
                    <span className="text-xs text-secondary font-code-num">
                      {item.date || item.createdAt?.split('T')[0]}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-surface-container-highest flex flex-wrap justify-between items-center gap-4 text-xs text-secondary">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                      <span>{item.location?.address || `${item.location?.district}, ${item.location?.state}`}</span>
                    </span>

                    {item.aiAnalysis && (
                      <span className="flex items-center gap-1 bg-surface-container px-2.5 py-0.5 rounded-md border border-surface-container-highest">
                        <span className="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
                        <span>AI Verified: {Math.round((item.aiAnalysis.confidence || 0.95) * 100)}% Match</span>
                      </span>
                    )}

                    {item.assignedUniversity && (
                      <span className="flex items-center gap-1 bg-tertiary-container/10 text-tertiary px-2.5 py-0.5 rounded-md border border-tertiary-container/30">
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        <span>{item.assignedUniversity}</span>
                      </span>
                    )}
                  </div>

                  <button className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform font-bold text-xs">
                    <span>Track Audit Trail</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CitizenComplaints;
