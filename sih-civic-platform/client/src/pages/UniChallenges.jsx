import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { universitiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function UniChallenges() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accept Challenge Modal
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [proposalPitch, setProposalPitch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const loadUniversityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch university list to locate current user's university profile
      const uniRes = await universitiesApi.getUniversities();
      let currentUni = null;
      if (uniRes && uniRes.success && Array.isArray(uniRes.universities)) {
        currentUni =
          uniRes.universities.find((u) => u.userId?._id === user?._id || u.userId === user?._id) ||
          uniRes.universities[0];
        setUniversity(currentUni);
      }

      // 2. Fetch challenges matched to this university (or 'me')
      const uniId = currentUni?._id || 'me';
      const chalRes = await universitiesApi.getChallenges(uniId);
      if (chalRes && chalRes.success) {
        setChallenges(chalRes.challenges || []);
      }
    } catch (err) {
      console.error('[UniChallenges] Load error:', err);
      setError(err.message || 'Failed to load university challenges');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadUniversityData();
  }, [loadUniversityData]);

  const handleAcceptChallenge = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    const uniId = university?._id || 'me';
    setIsAccepting(true);

    try {
      const res = await universitiesApi.acceptChallenge(uniId, selectedChallenge._id);
      if (res && res.success && res.project) {
        showToast(
          `Challenge accepted! Formed applied R&D Project for "${selectedChallenge.title}".`,
          'success'
        );
        setSelectedChallenge(null);
        navigate(`/university/projects/${res.project._id}`);
      } else {
        throw new Error(res?.message || 'Failed to accept challenge');
      }
    } catch (err) {
      console.error('[UniChallenges] Accept error:', err);
      showToast(`Acceptance failed: ${err.message}`, 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const categories = ['ALL', 'water_resources', 'environment', 'energy', 'urban_development', 'education'];

  const filteredChallenges = challenges.filter((c) => {
    if (filterCategory === 'ALL') return true;
    return (c.category || '').toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Jharkhand State University Innovation & Capstone Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Municipal Problem Statements & Civic Challenges
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            Apply applied engineering, IoT telemetry, and environmental research to solve verified citizen grievances with state CSR seed co-funding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-secondary block">Logged Institution:</span>
            <strong className="text-xs text-on-surface font-bold">
              {university?.name || 'BIT Mesra, Ranchi'}
            </strong>
          </div>
          <button
            onClick={() => navigate('/university/profile')}
            className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-bold text-on-surface transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-primary">verified_user</span>
            <span>AISHE Profile</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap capitalize ${
              filterCategory === cat
                ? 'bg-tertiary-container text-white font-bold shadow-sm'
                : 'bg-surface-container-low border border-surface-container-highest text-secondary hover:text-on-surface'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-secondary">Matching civic challenges against university research profile...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-surface-container-low border border-red-500/40 rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="text-sm text-on-surface font-semibold">{error}</p>
          <button
            onClick={loadUniversityData}
            className="px-4 py-2 bg-tertiary-container text-white text-xs font-bold rounded-xl"
          >
            Retry Matching
          </button>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-surface-container-highest rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-secondary opacity-40">science</span>
          <h3 className="text-base font-bold text-on-surface">No Unassigned Challenges</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            All current civic challenges matching your engineering disciplines have been assigned or resolved.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => {
            // Find AI score for this university
            const matchedSug = (challenge.suggestedUniversities || []).find(
              (s) => s.universityId === university?._id || s.universityId?._id === university?._id
            );
            const scorePct = matchedSug ? Math.round(matchedSug.score * 100) : 88;
            const urn = challenge.urn || `SAM-2026-${challenge._id.slice(-6).toUpperCase()}`;

            return (
              <div
                key={challenge._id}
                className="bg-surface-container-low hover:bg-surface-container border border-surface-container-highest hover:border-tertiary-container/60 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-surface-container text-primary font-mono text-xs font-bold rounded-lg border border-surface-container-highest">
                        {urn}
                      </span>
                      <span className="px-2.5 py-1 bg-tertiary-container/15 text-tertiary border border-tertiary-container/30 text-xs font-bold rounded-lg capitalize">
                        {challenge.category?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span className="px-3 py-1 bg-[#003824] text-[#4edea3] border border-[#00b07a] text-xs font-bold rounded-full font-code-num flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      <span>{scorePct}% Match (60/40 Weighted)</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/complaints/${challenge._id}`)}
                    className="text-lg sm:text-xl font-bold text-on-surface hover:text-tertiary cursor-pointer transition-colors leading-snug"
                  >
                    {challenge.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-secondary line-clamp-3 leading-relaxed">
                    {challenge.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-1 border-t border-surface-container-highest/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      <span>{challenge.district}, Jharkhand</span>
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span className="uppercase">{challenge.urgency} Urgency</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-container-highest">
                  <button
                    type="button"
                    onClick={() => navigate(`/complaints/${challenge._id}`)}
                    className="text-xs font-semibold text-secondary hover:text-on-surface flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setProposalPitch(
                        `Our applied engineering team proposes to solve "${challenge.title}" using local field testing, sensor monitoring, and prototype deployment.`
                      );
                    }}
                    className="px-4 py-2 bg-tertiary-container hover:bg-[#009b6a] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">handshake</span>
                    <span>Accept Challenge & Form Project</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Challenge & Form Project Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-surface-container-highest pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-tertiary font-mono">
                  {selectedChallenge.urn || `SAM-2026-${selectedChallenge._id.slice(-6).toUpperCase()}`}
                </span>
                <h3 className="text-lg font-bold text-on-surface">
                  Form Applied R&D Project
                </h3>
                <p className="text-xs text-secondary">
                  Institution: <strong className="text-on-surface">{university?.name || 'BIT Mesra'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="p-1 text-secondary hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAcceptChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Problem Statement
                </label>
                <div className="p-3 bg-surface-container rounded-xl text-xs text-on-surface font-semibold border border-surface-container-highest">
                  {selectedChallenge.title}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Preliminary Innovation Approach / Proposal Abstract *
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalPitch}
                  onChange={(e) => setProposalPitch(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-3.5 text-on-surface text-xs sm:text-sm focus:border-tertiary-container outline-none"
                  placeholder="Outline your department capstone team structure, laboratory resources, and preliminary milestone plan..."
                />
              </div>

              <div className="p-3 bg-surface-container rounded-xl text-xs text-secondary space-y-1 border border-surface-container-highest">
                <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Automated Milestone Initiation</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Upon acceptance, this civic problem will transition to <strong>Assigned</strong>, creating a formal project workspace with 3 baseline engineering milestones (Proposal Assessment, Prototype Development, Field Testing).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  disabled={isAccepting}
                  className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-xs font-bold text-secondary hover:text-on-surface rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAccepting}
                  className="px-6 py-2.5 bg-tertiary-container hover:bg-[#009b6a] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {isAccepting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Confirm & Open Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
