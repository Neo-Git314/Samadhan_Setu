import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function UniversityProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [institutionName, setInstitutionName] = useState(
    user?.organization || 'Birla Institute of Technology, Mesra'
  );
  const [aisheCode, setAisheCode] = useState(user?.aisheCode || 'U-0120');
  const [nodalEmail, setNodalEmail] = useState(user?.email || 'anita@bitmesra.ac.in');
  const [researchDisciplines, setResearchDisciplines] = useState(
    'Water Resources, Environmental Engineering, IoT Embedded Systems, Public Infrastructure'
  );

  const handleSave = (e) => {
    e.preventDefault();
    showToast('University Profile updated and verified with AISHE registry', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center border border-tertiary-container/30 shrink-0">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t('nav_uni_profile', 'University Institutional Profile')}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              Academic R&D Incubation and AISHE Verification Credentials
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Institution Name</label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">MoE AISHE Code *</label>
            <input
              type="text"
              value={aisheCode}
              onChange={(e) => setAisheCode(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface font-code-num focus:border-primary-container outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Nodal Dean / R&D Email</label>
            <input
              type="email"
              value={nodalEmail}
              onChange={(e) => setNodalEmail(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Incubation Center Status</label>
            <div className="px-4 py-2.5 bg-surface-container rounded-xl border border-surface-container-highest flex items-center justify-between">
              <span className="text-on-surface text-sm font-semibold">MoE / DST Recognized</span>
              <span className="px-2.5 py-0.5 bg-[#003b26] text-[#6ffbbe] text-xs font-bold rounded-full">Active</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1.5">Research Disciplines & Lab Facilities</label>
          <textarea
            rows={3}
            value={researchDisciplines}
            onChange={(e) => setResearchDisciplines(e.target.value)}
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-4 text-on-surface text-sm leading-relaxed focus:border-primary-container outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-tertiary-container hover:bg-tertiary text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Save Profile Credentials
          </button>
        </div>
      </form>
    </div>
  );
}

export default UniversityProfile;
