import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function UniChallenges() {
  const { projects } = useData();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [biddingProjectId, setBiddingProjectId] = useState(null);
  const [proposalPitch, setProposalPitch] = useState('');

  const domains = ['ALL', 'Water Purification', 'Environmental Sanitation', 'Grid IoT Systems', 'Urban Roads'];

  const filteredProjects = projects.filter((p) => {
    if (selectedDomain === 'ALL') return true;
    return (p.domain || '').toLowerCase().includes(selectedDomain.toLowerCase());
  });

  const handleBidSubmit = (e) => {
    e.preventDefault();
    showToast('Innovation Bid and R&D Prototype Proposal submitted to Nodal Screening Committee', 'success');
    setBiddingProjectId(null);
    setProposalPitch('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Jharkhand State University Innovation & R&D Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {t('uni_challenges_title', 'Municipal Problem Statements & Capstone Challenges')}
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            {t('uni_challenges_desc', 'Apply engineering research to solve verified citizen grievances with direct CSR seed co-funding.')}
          </p>
        </div>

        <button
          onClick={() => navigate('/university/profile')}
          className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-xs font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-base">verified_user</span>
          <span>AISHE Credentials</span>
        </button>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedDomain === d
                ? 'bg-tertiary-container text-white font-bold shadow-sm'
                : 'bg-surface-container-low border border-surface-container-highest text-secondary hover:text-on-surface'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            className="bg-surface-container-low hover:bg-surface-container border border-surface-container-highest hover:border-tertiary-container/60 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-3">
                <span className="px-3 py-1 bg-tertiary-container/15 text-tertiary border border-tertiary-container/30 text-xs font-bold rounded-lg">
                  {project.domain || 'Clean Tech'}
                </span>
                <span className="px-3 py-1 bg-[#003824]/40 text-[#4edea3] border border-[#00b07a]/40 text-xs font-bold rounded-full font-code-num">
                  Grant: {project.grantAmount || '₹ 2,50,000'}
                </span>
              </div>

              <h3
                onClick={() => navigate(`/university/projects/${project._id}`)}
                className="text-lg sm:text-xl font-bold text-on-surface hover:text-tertiary cursor-pointer transition-colors leading-snug"
              >
                {project.title}
              </h3>

              <p className="text-xs sm:text-sm text-secondary line-clamp-3 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="pt-4 border-t border-surface-container-highest space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-surface-container rounded-xl">
                  <span className="text-secondary block mb-0.5">Assigned Lead</span>
                  <span className="font-bold text-on-surface truncate block">{project.leadName || 'Dr. Anita Sharma'}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-xl">
                  <span className="text-secondary block mb-0.5">Milestone Progress</span>
                  <span className="font-bold text-tertiary block font-code-num">{project.progress || '65% Complete'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/university/projects/${project._id}`)}
                  className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-bold text-on-surface transition-all text-center"
                >
                  View Milestones
                </button>

                <button
                  onClick={() => setBiddingProjectId(project._id)}
                  className="flex-1 py-2.5 bg-tertiary-container hover:bg-tertiary text-white rounded-xl text-xs font-bold shadow-md transition-all text-center"
                >
                  Submit Proposal Bid
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bid Modal */}
      {biddingProjectId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
              <h3 className="text-lg font-bold text-on-surface">Submit Capstone Proposal</h3>
              <button
                onClick={() => setBiddingProjectId(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">
                  Technical Architecture & Methodology Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalPitch}
                  onChange={(e) => setProposalPitch(e.target.value)}
                  placeholder="Explain your proposed technological intervention, hardware bill of materials, and expected turnaround..."
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-3.5 text-on-surface text-sm focus:border-tertiary-container outline-none"
                />
              </div>

              <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest text-xs text-secondary">
                <span>By submitting, your institution agrees to Govt. of Jharkhand Higher Education R&D Guidelines and monthly milestone audit sign-offs.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBiddingProjectId(null)}
                  className="px-4 py-2 bg-surface-container rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-tertiary-container hover:bg-tertiary text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Submit Innovation Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniChallenges;
