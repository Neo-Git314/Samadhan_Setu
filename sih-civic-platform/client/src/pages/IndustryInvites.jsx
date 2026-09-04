import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

function IndustryInvites() {
  const { projects } = useData();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([
    {
      id: 'inv1',
      title: 'Solar-Powered Rural Water Filtration & IoT Sensing',
      university: 'Birla Institute of Technology, Mesra',
      requestedGrant: '₹ 2,50,000',
      status: 'Pending Review',
      domain: 'Clean Water & Energy',
      impact: '300+ households in Kanke Block, Ranchi',
      date: '04 Feb 2026'
    },
    {
      id: 'inv2',
      title: 'AI Smart Drainage Gate Desilting Telemetry',
      university: 'NIT Jamshedpur Civil Innovation Cell',
      requestedGrant: '₹ 4,00,000',
      status: 'Pending Review',
      domain: 'Urban Flood Prevention',
      impact: 'Bistupur Drainage Corridor, Jamshedpur',
      date: '05 Feb 2026'
    }
  ]);

  const handleAccept = (id) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'Co-Funded' } : inv))
    );
    showToast('CSR Seed Grant Allocation approved and MoU generated under MCA Section 135', 'success');
  };

  const handleDecline = (id) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    showToast('Innovation Co-Funding invitation declined', 'info');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
            <span>Corporate Social Responsibility (CSR) Co-Funding Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {t('nav_industry_invites', 'Industry Innovation & Grant Invites')}
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            Partner with top academic research hubs to co-fund and scale high-impact municipal engineering interventions.
          </p>
        </div>

        <button
          onClick={() => navigate('/industry/profile')}
          className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-sm font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-lg">business</span>
          <span>Corporate CIN & CSR Pool</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Total CSR Grant Pool</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-on-surface mt-1">₹ 35,00,000</div>
          <span className="text-xs text-primary font-medium mt-1 block">MCA Section 135 Compliant</span>
        </div>

        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Committed / Disbursed</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-[#4edea3] mt-1">₹ 6,50,000</div>
          <span className="text-xs text-secondary mt-1 block">Across 2 Academic Hubs</span>
        </div>

        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-secondary font-medium">Pending Match Requests</span>
          <div className="text-2xl sm:text-3xl font-bold font-code-num text-primary mt-1">
            {invitations.filter((i) => i.status === 'Pending Review').length}
          </div>
          <span className="text-xs text-secondary mt-1 block">Awaiting Corporate Approval</span>
        </div>
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">Incoming Co-Funding Requests</h2>

        {invitations.length === 0 ? (
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-12 text-center text-secondary">
            No active co-funding invitations at this time.
          </div>
        ) : (
          invitations.map((inv) => {
            const isCoFunded = inv.status === 'Co-Funded';
            return (
              <div
                key={inv.id}
                className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-tertiary-container/20 text-tertiary border border-tertiary-container/40 text-xs font-bold rounded-lg">
                        {inv.domain}
                      </span>
                      <StatusBadge status={inv.status} size="md" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-on-surface">{inv.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-secondary block font-medium">Requested Seed Capital</span>
                    <span className="text-xl sm:text-2xl font-bold font-code-num text-primary">
                      {inv.requestedGrant}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-container p-4 rounded-xl border border-surface-container-highest">
                  <div>
                    <span className="text-secondary block mb-0.5">Academic Hub</span>
                    <span className="font-bold text-on-surface text-sm">{inv.university}</span>
                  </div>
                  <div>
                    <span className="text-secondary block mb-0.5">Citizen Beneficiary Target</span>
                    <span className="font-bold text-on-surface text-sm">{inv.impact}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-end gap-3">
                  {!isCoFunded ? (
                    <>
                      <button
                        onClick={() => handleDecline(inv.id)}
                        className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-error transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(inv.id)}
                        className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>Approve & Disburse CSR Tranche</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-[#4edea3] flex items-center gap-1 bg-[#003824]/40 px-3 py-1.5 rounded-xl border border-[#00b07a]/40">
                      <span className="material-symbols-outlined text-base">verified</span>
                      <span>Grant Committed • Tracked via Smart Contract</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default IndustryInvites;
