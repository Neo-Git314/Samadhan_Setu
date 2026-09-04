import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

export default function IndustryInvites() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getProjects({ industryPartnerId: 'me' });
      if (res && res.success) {
        setProjects(res.projects || []);
      }
    } catch (err) {
      console.error('[IndustryInvites] Fetch error:', err);
      setError(err.message || 'Failed to fetch industry invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleResponse = async (projectId, accepted) => {
    try {
      setActionInProgress(projectId);
      const res = await projectsApi.respondIndustry(projectId, {
        accepted,
        decision: accepted ? 'accept' : 'decline'
      });

      if (res && res.success) {
        showToast(
          accepted
            ? 'CSR Co-Funding grant accepted! Project approved under MCA Section 135.'
            : 'Project co-funding invitation declined.',
          accepted ? 'success' : 'info'
        );
        fetchInvites();
      }
    } catch (err) {
      console.error('[IndustryInvites] Response error:', err);
      showToast(`Action failed: ${err.message}`, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // KPIs
  const totalInvites = projects.length;
  const approvedCount = projects.filter((p) => p.status === 'approved' || p.status === 'in_progress' || p.status === 'completed').length;
  const pendingCount = projects.filter((p) => p.status === 'proposed').length;

  const committedGrantAmount = approvedCount * 250000;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
            <span>Corporate Social Responsibility (CSR) Co-Funding Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Industry Innovation & Grant Invites
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            Partner with top academic research hubs across Jharkhand to co-fund and scale high-impact municipal engineering interventions.
          </p>
        </div>

        <button
          onClick={() => navigate('/industry/profile')}
          className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-xs font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-lg text-primary">business</span>
          <span>Corporate CIN & CSR Pool</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Total CSR Grant Pool</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-on-surface mt-1">
            ₹ 35,00,000
          </div>
          <span className="text-xs text-primary font-medium mt-1 block">
            MCA Section 135 Compliant
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Committed / Disbursed</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-[#4edea3] mt-1">
            ₹ {committedGrantAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-secondary mt-1 block">
            Active in {approvedCount} University Hub(s)
          </span>
        </div>

        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Pending Match Requests</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-amber-400 mt-1">
            {pendingCount}
          </div>
          <span className="text-xs text-secondary mt-1 block">
            Awaiting Corporate Approval
          </span>
        </div>
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-on-surface">
            Academic Co-Funding Proposals ({projects.length})
          </h2>
          <button
            onClick={fetchInvites}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh Feed</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-secondary">Fetching CSR grant invitations from universities...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-surface-container-low border border-red-500/40 rounded-2xl text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
            <p className="text-sm text-on-surface font-semibold">{error}</p>
            <button
              onClick={fetchInvites}
              className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 bg-surface-container-low border border-surface-container-highest rounded-2xl text-center space-y-3">
            <span className="material-symbols-outlined text-5xl text-secondary opacity-40">handshake</span>
            <h3 className="text-base font-bold text-on-surface">No Pending CSR Invitations</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              When university capstone innovators invite your company for seed funding, the grant requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const complaint = project.complaintId || {};
              const university = project.universityId || {};
              const isApproved = project.status === 'approved' || project.status === 'in_progress' || project.status === 'completed';
              const isProposed = project.status === 'proposed';

              return (
                <div
                  key={project._id}
                  className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-primary-container/20 text-primary border border-primary-container/30 text-xs font-bold rounded-lg font-mono">
                        PROJECT-{project._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 bg-surface-container text-secondary rounded-lg text-xs capitalize">
                        {complaint.category || 'Civil Engineering'}
                      </span>
                      <StatusBadge status={project.status} size="sm" />
                      {isApproved && (
                        <span className="px-2.5 py-0.5 bg-[#003824] text-[#4edea3] text-xs font-bold rounded-lg border border-[#00b07a]">
                          Co-Funded
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => navigate(`/university/projects/${project._id}`)}
                      className="text-base sm:text-lg font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                    >
                      {complaint.title || 'Municipal Technology Solution'}
                    </h3>

                    <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-2">
                      {complaint.description || 'Civic infrastructure improvement prototype.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-1">
                      <span className="flex items-center gap-1 font-semibold text-on-surface">
                        <span className="material-symbols-outlined text-sm text-tertiary">school</span>
                        <span>{university.name || 'BIT Mesra, Ranchi'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{complaint.district || 'Ranchi'}, Jharkhand</span>
                      </span>
                      <span className="text-primary font-bold font-mono">
                        Requested Seed Grant: ₹ 2,50,000
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-surface-container-highest pt-3 md:pt-0">
                    <button
                      onClick={() => navigate(`/university/projects/${project._id}`)}
                      className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-1"
                    >
                      <span>Inspect R&D</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>

                    {isProposed && (
                      <div className="flex gap-2">
                        <button
                          disabled={actionInProgress === project._id}
                          onClick={() => handleResponse(project._id, true)}
                          className="px-4 py-2 bg-[#003824] hover:bg-[#004d32] text-[#4edea3] border border-[#00b07a] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          <span>Accept Grant</span>
                        </button>
                        <button
                          disabled={actionInProgress === project._id}
                          onClick={() => handleResponse(project._id, false)}
                          className="px-3 py-2 bg-surface-container hover:bg-red-500/20 text-secondary hover:text-red-400 border border-surface-container-highest text-xs font-bold rounded-xl transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
