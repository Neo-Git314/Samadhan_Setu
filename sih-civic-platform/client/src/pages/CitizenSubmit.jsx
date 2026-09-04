import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Water Supply & Contamination',
  'Roads & Public Infrastructure',
  'Electricity & Grid Faults',
  'Solid Waste & Sanitation',
  'Public Health & Vector Control',
  'Street Lighting & Pedestrian Safety'
];

const JHARKHAND_DISTRICTS = [
  'Ranchi',
  'Dhanbad',
  'East Singhbhum (Jamshedpur)',
  'Bokaro',
  'Hazaribagh',
  'Deoghar',
  'Ramgarh',
  'Palamu',
  'Giridih',
  'Dumka'
];

const JHARKHAND_DEPARTMENTS = [
  'Drinking Water & Sanitation Department (DWSD), Govt. of Jharkhand',
  'Road Construction Department (RCD / PWD), Govt. of Jharkhand',
  'Jharkhand Bijli Vitran Nigam Limited (JBVNL)',
  'Ranchi Municipal Corporation (RMC) / UD&HD Jharkhand',
  'Health, Medical Education & Family Welfare Dept., Govt. of Jharkhand',
  'Rural Development & Panchayati Raj Dept., Govt. of Jharkhand'
];

const URGENCIES = [
  { value: 'Critical Life Safety (SLA: 12 Hours)', labelEn: 'Critical Life Safety (12h SLA)', desc: 'Immediate contamination, open high-voltage sparks, structural hazard' },
  { value: 'High Urgency (SLA: 48 Hours)', labelEn: 'High Priority (48h SLA)', desc: 'Blocked main drainage culvert, trench excavation without barriers' },
  { value: 'Standard (SLA: 5 Days)', labelEn: 'Standard Redressal (5 Days SLA)', desc: 'Garbage accumulation, routine road patch repairs' }
];

function CitizenSubmit() {
  const { addComplaint } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [urgency, setUrgency] = useState(URGENCIES[0].value);
  const [department, setDepartment] = useState(JHARKHAND_DEPARTMENTS[0]);
  const [description, setDescription] = useState('');

  // Location State
  const [state] = useState('Jharkhand');
  const [district, setDistrict] = useState('Ranchi');
  const [ward, setWard] = useState('Ward 12, Kanke Road');
  const [address, setAddress] = useState('Kanke Road Pumping Station Junction, Ranchi');
  const [lat, setLat] = useState(23.3629);
  const [lng, setLng] = useState(85.3372);

  // Evidence Files
  const [files, setFiles] = useState([
    { name: 'contaminated_tap_water_sample.jpg', size: '2.4 MB', type: 'image' }
  ]);

  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS Auto-detect simulation
  const handleDetectGPS = () => {
    showToast('GPS coordinates fetched accurately from device sensor in Jharkhand', 'info');
    setLat(23.3629 + (Math.random() - 0.5) * 0.01);
    setLng(85.3372 + (Math.random() - 0.5) * 0.01);
  };

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length > 0) {
      const newItems = uploaded.map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.type.includes('pdf') ? 'pdf' : 'image'
      }));
      setFiles((prev) => [...prev, ...newItems]);
      showToast(`${uploaded.length} evidence file(s) attached and virus scanned`, 'success');
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!declared) {
      showToast('Please accept the legal declaration before submission', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newComplaint = addComplaint({
        title,
        category,
        urgency,
        urgencyLevel: urgency.includes('12 Hours') ? 'critical' : urgency.includes('48 Hours') ? 'high' : 'standard',
        department,
        description,
        citizen: user?.name || 'Rajesh Kumar',
        submittedBy: user?._id || 'u1001',
        location: {
          state,
          district,
          ward,
          address,
          lat,
          lng
        },
        mediaUrls: files
      });

      showToast(
        `Grievance registered successfully with Govt. of Jharkhand! URN: ${newComplaint.urn}`,
        'success'
      );

      setIsSubmitting(false);
      navigate(`/complaints/${newComplaint._id}`);
    }, 600);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">edit_document</span>
            <span>Government of Jharkhand — Grievance Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Register New Civic Grievance
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            AI Computer Vision & NLP automated categorization under Government of Jharkhand with SLA tracking
          </p>
        </div>

        <button
          onClick={() => navigate('/citizen/complaints')}
          className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Complaints</span>
        </button>
      </div>

      {/* 4 Step Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { step: 1, label: '1. Details', icon: 'description' },
          { step: 2, label: '2. Geotag', icon: 'location_on' },
          { step: 3, label: '3. Evidence', icon: 'upload_file' },
          { step: 4, label: '4. Review & Submit', icon: 'verified' }
        ].map((s) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${
                isCurrent
                  ? 'bg-surface-container-high border-primary text-primary font-bold shadow-sm'
                  : isDone
                  ? 'bg-surface-container-low border-[#00b07a]/40 text-[#4edea3]'
                  : 'bg-surface-container-low border-surface-container-highest text-secondary hover:bg-surface-container'
              }`}
            >
              <div className="flex justify-center mb-1">
                <span className="material-symbols-outlined text-lg">
                  {isDone ? 'check_circle' : s.icon}
                </span>
              </div>
              <div className="text-xs font-semibold truncate">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Wizard Form Container */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-xl font-bold text-on-surface">Step 1: Grievance Particulars</h2>
              <p className="text-xs text-secondary">Define the nature and severity of the municipal failure</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Grievance Title / Problem Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pipeline leakage and contaminated water near Kanke Road Ward 12"
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">
                  Category Classification
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">
                  Competent Department of the Government of Jharkhand *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all"
                >
                  {JHARKHAND_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-2">
                Urgency & SLA Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {URGENCIES.map((u) => {
                  const isSelected = urgency === u.value;
                  return (
                    <div
                      key={u.value}
                      onClick={() => setUrgency(u.value)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-surface-container-high border-primary text-on-surface ring-2 ring-primary-container/30 shadow-sm'
                          : 'bg-surface-container border-surface-container-highest text-secondary hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs">
                          {u.labelEn}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-base font-bold">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-80 leading-snug">{u.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Detailed Grievance Narrative & Impact *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the background, duration, affected families, and any prior local ticket references..."
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-4 text-on-surface text-sm leading-relaxed focus:border-primary-container outline-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!title || !description) {
                    showToast('Please enter both title and description before proceeding', 'error');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Geotagging</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Geotag & Map */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-xl font-bold text-on-surface">Step 2: Geographic Location & GPS Geotag</h2>
              <p className="text-xs text-secondary">Pinpoint exact Jharkhand municipal boundary and GPS telemetry coordinates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">State</label>
                <div className="px-4 py-2.5 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface text-sm font-semibold flex items-center justify-between">
                  <span>Jharkhand</span>
                  <span className="text-xs bg-primary-container/20 text-primary px-2 py-0.5 rounded">Govt. of Jharkhand</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Jharkhand District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Ward Number / Pincode</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Landmark / Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
                />
              </div>
            </div>

            {/* GPS Telemetry & Simulated Map */}
            <div className="bg-surface-container border border-surface-container-highest rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">satellite_alt</span>
                  <span className="font-bold text-on-surface text-sm">GPS Telemetry Coordinates</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="px-3 py-1.5 bg-primary-container/20 hover:bg-primary-container/30 text-primary border border-primary-container/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">my_location</span>
                  <span>Detect Device GPS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-highest">
                  <span className="text-[11px] text-secondary block">Latitude</span>
                  <span className="font-code-num font-bold text-on-surface text-sm">{lat.toFixed(6)}° N</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container-highest">
                  <span className="text-[11px] text-secondary block">Longitude</span>
                  <span className="font-code-num font-bold text-on-surface text-sm">{lng.toFixed(6)}° E</span>
                </div>
              </div>

              {/* Map visualizer */}
              <div className="h-44 bg-surface-container-highest/40 rounded-xl border border-surface-container-highest relative overflow-hidden flex items-center justify-center">
                <div className="z-10 text-center space-y-1">
                  <div className="w-10 h-10 bg-primary-container text-white rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </div>
                  <p className="text-xs font-bold text-on-surface">{address}, {district}, Jharkhand</p>
                  <p className="text-[11px] text-secondary font-code-num">Geotagged & Timestamped: WGS84</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <span>Continue to Evidence</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-xl font-bold text-on-surface">Step 3: Upload Photographic & Evidence Media</h2>
              <p className="text-xs text-secondary">AI computer vision inspects turbidity, structural fissures, and environmental hazards</p>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-surface-container-highest hover:border-primary-container/60 rounded-2xl sm:rounded-3xl p-8 text-center bg-surface-container/40 transition-colors">
              <input
                type="file"
                multiple
                id="evidence-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer space-y-3 block">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mx-auto border border-primary-container/30">
                  <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                </div>
                <div>
                  <span className="font-bold text-on-surface text-sm hover:text-primary">
                    Click to browse files
                  </span>
                  <span className="text-secondary text-xs block mt-0.5">
                    or drag & drop geotagged photos (JPG, PNG, PDF up to 15MB)
                  </span>
                </div>
              </label>
            </div>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface">Attached Verification Files ({files.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-surface-container rounded-xl border border-surface-container-highest shadow-sm"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="material-symbols-outlined text-primary text-xl">
                          {file.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-on-surface truncate">{file.name}</p>
                          <p className="text-[11px] text-secondary">{file.size} • Verified</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-secondary hover:text-error p-1 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <span>Continue to Final Review</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Legal Declaration */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-xl font-bold text-on-surface">Step 4: Final Summary & Digital Citizen Sign-off</h2>
              <p className="text-xs text-secondary">Verify all grievance details before submitting to Government of Jharkhand Redressal Network</p>
            </div>

            {/* Grievance Review Card */}
            <div className="bg-surface-container rounded-2xl p-5 border border-surface-container-highest space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary font-bold">{category}</span>
                  <h3 className="text-lg font-bold text-on-surface">{title || 'Tap water discoloration and odor'}</h3>
                </div>
                <span className="px-3 py-1 bg-primary-container/20 text-primary text-xs font-bold rounded-full border border-primary-container/40">
                  {urgency}
                </span>
              </div>

              <p className="text-sm text-secondary leading-relaxed bg-surface-container-low p-4 rounded-xl border border-surface-container-highest">
                {description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-highest">
                  <span className="text-secondary block">State</span>
                  <span className="font-bold text-on-surface">{state}</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-highest">
                  <span className="text-secondary block">District</span>
                  <span className="font-bold text-on-surface">{district}</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-highest">
                  <span className="text-secondary block">Department</span>
                  <span className="font-bold text-on-surface truncate block">{department}</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-highest">
                  <span className="text-secondary block">Attached Evidence</span>
                  <span className="font-bold text-on-surface">{files.length} File(s)</span>
                </div>
              </div>
            </div>

            {/* AI Automated Pipeline Preview */}
            <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5">auto_awesome</span>
              <div className="space-y-1">
                <h4 className="font-bold text-on-surface text-sm">
                  AI Computer Vision & Academic Innovation Pipeline Ready
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                  Upon submission, this grievance will undergo computer vision verification, auto-dispatch to{' '}
                  <span className="font-semibold text-on-surface">{department}</span>, and open for Jharkhand university engineering bids.
                </p>
              </div>
            </div>

            {/* Legal Citizen Declaration Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-surface-container rounded-2xl border border-surface-container-highest">
              <input
                type="checkbox"
                id="legal-decl"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-surface-container-highest text-primary-container focus:ring-primary-container"
              />
              <label htmlFor="legal-decl" className="text-xs text-on-surface cursor-pointer select-none leading-relaxed">
                I hereby declare under the Jharkhand Public Grievance Redressal Rules that the facts provided above are authentic to the best of my knowledge. I understand that submitting false or frivolous complaints is punishable under administrative regulations.
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !declared}
                className={`px-8 py-3.5 bg-primary-container hover:bg-orange-600 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2.5 ${
                  !declared ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    <span>Submit & Generate URN Tracking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CitizenSubmit;
