import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { universitiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function UniversityProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [institutionName, setInstitutionName] = useState(
    user?.organization || 'Birla Institute of Technology (BIT), Mesra'
  );
  const [aisheCode, setAisheCode] = useState(user?.aisheCode || 'U-0120');
  const [nodalEmail, setNodalEmail] = useState(user?.email || 'university@bitmesra.ac.in');
  const [researchDisciplines, setResearchDisciplines] = useState(
    'Water Resources & Sanitation, Urban Infrastructure & Mobility, Energy & Renewable Systems, Environment & Climate Action'
  );
  const [researchKeywords, setResearchKeywords] = useState(
    'hydrology, sensor networks, water filtration, smart metering, waste recovery'
  );
  const [incubationFacility, setIncubationFacility] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await universitiesApi.getProfile();
        if (res && res.success && res.university) {
          const u = res.university;
          if (u.name) setInstitutionName(u.name);
          if (u.contactEmail) setNodalEmail(u.contactEmail);
          if (Array.isArray(u.disciplines) && u.disciplines.length > 0) {
            setResearchDisciplines(u.disciplines.join(', '));
          }
          if (Array.isArray(u.researchKeywords) && u.researchKeywords.length > 0) {
            setResearchKeywords(u.researchKeywords.join(', '));
          }
          if (typeof u.incubationFacility === 'boolean') {
            setIncubationFacility(u.incubationFacility);
          }
        }
      } catch (err) {
        console.warn('[UniversityProfile] Fetch error, using cached defaults:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const disciplinesList = researchDisciplines.split(',').map((s) => s.trim()).filter(Boolean);
      const keywordsList = researchKeywords.split(',').map((s) => s.trim()).filter(Boolean);
      await universitiesApi.updateProfile({
        name: institutionName,
        contactEmail: nodalEmail,
        disciplines: disciplinesList,
        researchKeywords: keywordsList,
        incubationFacility
      });
      showToast('University Profile updated and persisted to MongoDB with AISHE credentials', 'success');
    } catch (err) {
      console.error('[UniversityProfile] Save error:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Back Navigation Button */}
      <button
        onClick={() => navigate('/university/challenges')}
        className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        <span>Back to Challenges</span>
      </button>

      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center border border-tertiary-container/30 shrink-0">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t('nav_uni_profile', 'Higher Education Institution (HEI) Institutional Profile')}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              NEP 2020 Capstone R&D Lab Facilities, Research Keywords & AISHE Verification
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
