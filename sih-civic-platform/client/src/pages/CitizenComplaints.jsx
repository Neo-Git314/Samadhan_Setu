import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/StatusBadge';

export default function CitizenComplaints() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMyComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await complaintsApi.getComplaints({ submittedBy: 'me' });
      if (res && res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error('[CitizenComplaints] Fetch error:', err);
      setError(err.message || 'Failed to fetch grievances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  // Dynamic KPI Counts
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const underRdCount = complaints.filter((c) => ['assigned', 'in_progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const urn = c.urn || `SAM-2026-${(c._id || '').slice(-6).toUpperCase()}`;
      const matchesSearch =
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        urn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusLower = (c.status || '').toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'PENDING') {
        matchesStatus = statusLower === 'pending';
      } else if (statusFilter === 'RD') {
        matchesStatus = ['assigned', 'in_progress'].includes(statusLower);
      } else if (statusFilter === 'RESOLVED') {
        matchesStatus = statusLower === 'resolved';
      }

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Government of Jharkhand — Citizen Grievance Portal</span>
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
          className="px-6 py-3.5 bg-primary-container hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Register Grievance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="text-xs text-secondary mt-1">100% Tracked via URN</div>
        </div>

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'PENDING'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Pending AI Triage</span>
            <span className="material-symbols-outlined text-lg text-primary">auto_awesome</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-primary">{pendingCount}</div>
          <div className="text-xs text-secondary mt-1">Classification Queue</div>
        </div>

        <div
          onClick={() => setStatusFilter('RD')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'RD'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Under University R&D</span>
            <span className="material-symbols-outlined text-lg text-tertiary">school</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-tertiary">{underRdCount}</div>
          <div className="text-xs text-secondary mt-1">Applied Engineering Projects</div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all shadow-sm ${
            statusFilter === 'RESOLVED'
              ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/30'
              : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
          }`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-xs font-semibold">Resolved & Verified</span>
            <span className="material-symbols-outlined text-lg text-[#4edea3]">check_circle</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-[#4edea3]">{resolvedCount}</div>
          <div className="text-xs text-secondary mt-1">Closed with Citizen Sign-off</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by URN, keyword, district, or category..."
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2 text-on-surface text-xs sm:text-sm focus:border-primary-container outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending AI Triage' },
            { id: 'RD', label: 'Under R&D' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
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
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-secondary">Fetching official citizen grievances from Jharkhand server...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-surface-container-low border border-red-500/40 rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="text-sm text-on-surface font-semibold">{error}</p>
          <button
            onClick={fetchMyComplaints}
            className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl"
          >
            Retry Fetch
          </button>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-surface-container-highest rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-secondary opacity-40">inbox</span>
          <h3 className="text-base font-bold text-on-surface">No Grievances Found</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            {searchQuery
              ? 'No grievances match your search query.'
              : 'You have not registered any grievances under this filter.'}
          </p>
          <button
            onClick={() => navigate('/citizen/submit')}
            className="px-5 py-2.5 bg-primary-container text-white text-xs font-bold rounded-xl shadow"
          >
            Register Your First Grievance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const urn = c.urn || `SAM-2026-${c._id.slice(-6).toUpperCase()}`;
            const dateStr = new Date(c.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={c._id}
                onClick={() => navigate(`/complaints/${c._id}`)}
                className="bg-surface-container-low hover:bg-surface-container border border-surface-container-highest hover:border-primary-container/40 rounded-2xl p-5 sm:p-6 shadow-sm transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-surface-container text-primary border border-primary-container/30 rounded-lg text-xs font-code-num font-bold">
                      {urn}
                    </span>
                    <span className="px-2.5 py-0.5 bg-surface-container text-secondary rounded-lg text-xs capitalize">
                      {c.category?.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    {c.needsReview && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded">
                        Needs Review
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>{c.district}, Jharkhand</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span>{dateStr}</span>
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span className="uppercase">{c.urgency} Priority</span>
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-2 border-t md:border-t-0 border-surface-container-highest pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-secondary block">Assigned University</span>
                    <span className="text-xs font-bold text-tertiary">
                      {c.assignedUniversity?.name || 'Pending Bidding'}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary hover:text-primary text-xl">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
