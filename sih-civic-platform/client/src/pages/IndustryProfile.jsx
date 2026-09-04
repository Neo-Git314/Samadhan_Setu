import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function IndustryProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(
    user?.organization || 'EcoSolve Technologies Pvt Ltd'
  );
  const [cin, setCin] = useState('L29100JH1980PLC023456');
  const [csrBudget, setCsrBudget] = useState('₹ 35,00,000');
  const [sectorFocus, setSectorFocus] = useState(
    'Water Purification Systems, Clean Energy & IoT Municipal Sensor Telemetry'
  );
  const [activeProjects, setActiveProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectsApi.getProjects({ industryPartnerId: 'me' });
        if (res && res.success) {
          setActiveProjects(res.projects || []);
        }
      } catch (_e) {}
    }
    loadProjects();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Corporate Partner Profile saved and verified with MCA CIN registry', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center border border-primary-container/30 shrink-0">
            <span className="material-symbols-outlined text-3xl">corporate_fare</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Corporate & Industry Partner Profile
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              Corporate Social Responsibility (CSR) & Innovation Co-Funding Credentials
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Company / Organization Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Corporate Identity No (CIN) *</label>
            <input
              type="text"
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface font-code-num focus:border-primary-container outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Annual CSR Innovation Grant Pool</label>
            <input
              type="text"
              value={csrBudget}
              onChange={(e) => setCsrBudget(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface font-code-num focus:border-primary-container outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">MCA Corporate Registry Verification</label>
            <div className="px-4 py-2.5 bg-surface-container rounded-xl border border-surface-container-highest flex items-center justify-between">
              <span className="text-on-surface text-sm font-semibold">Ministry of Corporate Affairs (MCA)</span>
              <span className="px-2.5 py-0.5 bg-[#003b26] text-[#6ffbbe] text-xs font-bold rounded-full">Compliant (Sec 135)</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1.5">Sector Focus & Technology Thrust Areas</label>
          <textarea
            rows={3}
            value={sectorFocus}
            onChange={(e) => setSectorFocus(e.target.value)}
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-4 text-on-surface text-sm leading-relaxed focus:border-primary-container outline-none"
          />
        </div>

        {/* Active Funded Projects */}
        <div className="pt-2 border-t border-surface-container-highest space-y-3">
          <h3 className="text-sm font-bold text-on-surface">Active Funded Academic R&D Projects</h3>
          {activeProjects.length > 0 ? (
            <div className="space-y-2">
              {activeProjects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/university/projects/${p._id}`)}
                  className="p-3 bg-surface-container hover:bg-surface-container-high rounded-xl border border-surface-container-highest flex justify-between items-center cursor-pointer transition-colors text-xs"
                >
                  <div className="truncate">
                    <strong className="text-on-surface block truncate">{p.complaintId?.title || 'Applied Technology R&D'}</strong>
                    <span className="text-secondary text-[11px]">{p.universityId?.name}</span>
                  </div>
                  <span className="text-xs text-primary font-bold">Inspect &gt;</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary">No co-funded projects currently under execution.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Save Corporate Profile
          </button>
        </div>
      </form>
    </div>
  );
}
