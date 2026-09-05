import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi, universitiesApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import JharkhandGisMap from '../components/JharkhandGisMap';

export default function AdminComplaints() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL'); // 'ALL' | 'academic_innovation' | 'routine_municipal'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'gis'

  // Selection & Batch Assignment
  const [selectedIds, setSelectedIds] = useState([]);
  const [assignUniModal, setAssignUniModal] = useState(false);
  const [chosenUniId, setChosenUniId] = useState('');

  const fetchComplaintsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [compRes, uniRes] = await Promise.all([
        complaintsApi.getComplaints({ limit: 50 }),
        universitiesApi.getUniversities()
      ]);

      if (compRes && compRes.success) {
        setComplaints(compRes.complaints || []);
      }
      if (uniRes && uniRes.success) {
        const unis = uniRes.universities || [];
        setUniversities(unis);
        if (unis.length > 0) setChosenUniId(unis[0]._id);
      }
    } catch (err) {
      console.error('[AdminComplaints] Fetch failure:', err);
      setError(err.message || 'Failed to load complaints matrix');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaintsData();
  }, [fetchComplaintsData]);

  // Status override handler
  const handleStatusOverride = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      const res = await complaintsApi.updateStatus(id, newStatus);
      if (res && res.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
        showToast(`Status updated to: ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      showToast(`Status update failed: ${err.message}`, 'error');
    }
  };

  // Batch University Assignment
  const handleBatchAssign = async () => {
    const selectedUni = universities.find((u) => u._id === chosenUniId);
    const uniName = selectedUni?.name || 'Assigned University';

    try {
      for (const compId of selectedIds) {
        await universitiesApi.acceptChallenge(chosenUniId, compId).catch(() => {});
      }
      showToast(`Dispatched ${selectedIds.length} grievances to ${uniName}`, 'success');
      setAssignUniModal(false);
      setSelectedIds([]);
      fetchComplaintsData();
    } catch (err) {
      showToast(`Batch dispatch failed: ${err.message}`, 'error');
    }
  };

  // Filtered List
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const urn = c.urn || `SAM-2026-${(c._id || '').slice(-6).toUpperCase()}`;
      const matchesSearch =
        urn.toLowerCase().includes(search.toLowerCase()) ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.submittedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.district?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || c.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesDistrict =
        districtFilter === 'ALL' || c.district?.toLowerCase() === districtFilter.toLowerCase();
      const matchesTrack =
        trackFilter === 'ALL' ||
        (trackFilter === 'routine_municipal' && c.resolutionTrack === 'routine_municipal') ||
        (trackFilter === 'academic_innovation' && c.resolutionTrack !== 'routine_municipal');

      return matchesSearch && matchesStatus && matchesDistrict && matchesTrack;
    });
  }, [complaints, search, statusFilter, districtFilter, trackFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const districts = ['ALL', 'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Hazaribagh', 'Deoghar'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Jharkhand State Nodal Command & Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Officer Grievance Triage Matrix
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            Jharkhand State master audit registry for SLA monitoring, district escalation, manual status overrides, and academic hub matching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-xs font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Analytics Dashboard</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setAssignUniModal(true)}
              className="px-5 py-3 bg-primary-container hover:bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">school</span>
              <span>Assign to University ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Dual-Track Triage Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-highest pb-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-secondary font-bold text-[11px] uppercase tracking-wider mr-1">Triage Track:</span>
            {[
              { label: 'All Tracks', value: 'ALL' },
              { label: '🎓 University R&D Tracks', value: 'academic_innovation' },
              { label: '🚜 Direct Municipal Action', value: 'routine_municipal' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTrackFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  trackFilter === tab.value
                    ? tab.value === 'routine_municipal'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-tertiary-container text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border border-surface-container-highest'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] text-secondary">
            Showing <strong className="text-on-surface font-bold">{filtered.length}</strong> challenges
          </span>
        </div>

        {/* Quick Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { label: 'All Challenges', value: 'ALL' },
            { label: 'Pending Triage', value: 'pending' },
            { label: 'Assigned to HEI', value: 'assigned' },
            { label: 'Active R&D', value: 'in_progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Marked False / Invalid', value: 'rejected' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-primary-container text-white shadow-sm font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border border-surface-container-highest'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by URN, keyword, complainant, or district..."
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2 text-on-surface text-xs sm:text-sm focus:border-primary-container outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending Triage</option>
              <option value="reviewed">Reviewed</option>
              <option value="assigned">Assigned to HEI</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
              <option value="rejected">Marked False / Invalid</option>
            </select>

            {/* District Dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Districts' : d}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">table_rows</span>
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('gis')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'gis'
                    ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">map</span>
                <span>GIS Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View: Table Matrix OR Interactive GIS Map */}
      {viewMode === 'gis' ? (
        <JharkhandGisMap complaints={filtered} />
      ) : loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-secondary">Fetching officer triage matrix from server...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-surface-container-low border border-red-500/40 rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="text-sm text-on-surface font-semibold">{error}</p>
          <button
            onClick={fetchComplaintsData}
            className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-surface-container-highest rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-secondary opacity-50">search_off</span>
          <h3 className="text-base font-bold text-on-surface">No Grievances Match Filters</h3>
          <p className="text-xs text-secondary">Try broadening your search term or district filter.</p>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container border-b border-surface-container-highest text-secondary uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-primary focus:ring-primary h-4 w-4 bg-surface-container-high border-surface-container-highest"
                    />
                  </th>
                  <th className="p-4">URN / Identification</th>
                  <th className="p-4">Grievance Summary</th>
                  <th className="p-4">Complainant</th>
                  <th className="p-4">District</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">AI Category</th>
                  <th className="p-4">Status Override</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest/60 text-on-surface">
                {filtered.map((c) => {
                  const urn = c.urn || `SAM-2026-${c._id.slice(-6).toUpperCase()}`;
                  const isSelected = selectedIds.includes(c._id);

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-surface-container/60 transition-colors ${
                        isSelected ? 'bg-primary-container/10' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c._id)}
                          className="rounded text-primary focus:ring-primary h-4 w-4 bg-surface-container-high border-surface-container-highest"
                        />
                      </td>

                      <td className="p-4 font-mono font-bold text-primary whitespace-nowrap">
                        {urn}
                      </td>

                      <td className="p-4 max-w-xs">
                        <span className="font-bold block truncate">{c.title}</span>
                        <span className="text-[11px] text-secondary line-clamp-1">{c.description}</span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="font-semibold text-on-surface block">{c.submittedBy?.name || 'Citizen'}</span>
                        {c.submitterType && (
                          <span className="text-[10px] text-primary capitalize block">
                            {c.submitterType.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap font-medium">
                        {c.district}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {c.surgeAlert || c.urgency === 'critical' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1 animate-pulse">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            <span>Critical / Surge</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-container/20 text-primary border border-primary-container/30">
                            {c.urgency}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="capitalize text-on-surface font-semibold block">
                          {c.category?.replace(/_/g, ' ')}
                        </span>
                        {c.resolutionTrack === 'routine_municipal' ? (
                          <span
                            className="text-[10px] text-amber-400 font-bold inline-flex items-center gap-0.5 mt-0.5"
                            title={c.triageReason || 'Routine municipal maintenance'}
                          >
                            <span className="material-symbols-outlined text-[12px]">handyman</span>
                            <span>Direct Municipal</span>
                          </span>
                        ) : (
                          <span
                            className="text-[10px] text-tertiary font-bold inline-flex items-center gap-0.5 mt-0.5"
                            title={c.triageReason || 'NEP 2020 University Capstone R&D'}
                          >
                            <span className="material-symbols-outlined text-[12px]">school</span>
                            <span>University R&D</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusOverride(c._id, e.target.value, e)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize outline-none ${
                            c.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-surface-container border-surface-container-highest text-on-surface'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="duplicate">Duplicate</option>
                          <option value="rejected">Mark False / Invalid</option>
                        </select>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-bold text-secondary hover:text-on-surface transition-all inline-flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Assign to University Modal */}
      {assignUniModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
              <h3 className="text-base font-bold text-on-surface">Batch Assign to Academic Hub</h3>
              <button
                onClick={() => setAssignUniModal(false)}
                className="p-1 text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Assign all <strong className="text-on-surface">{selectedIds.length}</strong> selected civic complaints to a premier engineering institution in Jharkhand for applied research and capstone resolution.
            </p>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Target Engineering University *
              </label>
              <select
                value={chosenUniId}
                onChange={(e) => setChosenUniId(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-3 text-xs sm:text-sm text-on-surface focus:border-primary outline-none"
              >
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssignUniModal(false)}
                className="px-4 py-2 bg-surface-container border border-surface-container-highest rounded-xl text-xs font-bold text-secondary hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchAssign}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
