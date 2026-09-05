import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { complaintsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Water Resources & Sanitation',
  'Agriculture & Rural Livelihoods',
  'Healthcare & Public Health',
  'Education & Skill Development',
  'Environment & Climate Action',
  'Energy & Renewable Systems',
  'Urban Infrastructure & Mobility',
  'Accessibility & Assistive Tech',
  'Public Administration & Governance',
  'Other Local Societal Needs'
];

const SUBMITTER_PERSONAS = [
  { id: 'Individual Citizen', label: 'Individual Citizen', icon: 'person', desc: 'Private resident filing for personal or neighborhood concern' },
  { id: 'Community Group / Self-Help Group (SHG)', label: 'Community Group / Self-Help Group (SHG)', icon: 'groups', desc: 'Local community organization, Mahila Mandal, or Youth Group' },
  { id: 'Panchayati Raj Institution (Gram Panchayat / PRI)', label: 'Panchayati Raj Institution (Gram Panchayat / PRI)', icon: 'holiday_village', desc: 'Gram Panchayat Mukhiya, Ward Member, or Block Representative' },
  { id: 'Urban Local Body (Municipal Corporation / ULB)', label: 'Urban Local Body (Municipal Corporation / ULB)', icon: 'location_city', desc: 'Municipal Corporation, Municipality, or Notified Area Committee' }
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
  'Department of Higher & Technical Education, Govt. of Jharkhand',
  'Drinking Water & Sanitation Department (DWSD), Govt. of Jharkhand',
  'Road Construction Department (RCD / PWD), Govt. of Jharkhand',
  'Jharkhand Bijli Vitran Nigam Limited (JBVNL)',
  'Ranchi Municipal Corporation (RMC) / UD&HD Jharkhand',
  'Health, Medical Education & Family Welfare Dept., Govt. of Jharkhand',
  'Rural Development & Panchayati Raj Dept., Govt. of Jharkhand'
];

// Custom pin for map picker
const PIN_ICON = L.divIcon({
  className: 'custom-pin',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      background: #ff6f00;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    ">
      <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Map click listener component
function MapClickHandler({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return position ? <Marker position={position} icon={PIN_ICON} /> : null;
}

export default function CitizenSubmit() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Submitter Persona & Category
  const [submitterType, setSubmitterType] = useState(SUBMITTER_PERSONAS[0].id);
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Step 2: Problem Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(JHARKHAND_DEPARTMENTS[0]);

  // Step 3: Geotagging & Evidence
  const [district, setDistrict] = useState('Ranchi');
  const [ward, setWard] = useState('Ward 12, Kanke Road');
  const [address, setAddress] = useState('Kanke Road Pumping Station Junction, Ranchi');
  const [lat, setLat] = useState(23.6102);
  const [lng, setLng] = useState(85.2799);
  const [rawFiles, setRawFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Step 4: Legal & Results
  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // OpenStreetMap Nominatim reverse geocoding
  const fetchAddressFromCoords = async (latitude, longitude) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        const matchDistrict = JHARKHAND_DISTRICTS.find((d) =>
          data.display_name.toLowerCase().includes(d.toLowerCase())
        );
        if (matchDistrict) {
          setDistrict(matchDistrict);
        }
      }
    } catch (err) {
      console.warn('[Geocoding] Nominatim lookup error:', err.message);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Device GPS
  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(6));
          const newLng = Number(pos.coords.longitude.toFixed(6));
          setLat(newLat);
          setLng(newLng);
          fetchAddressFromCoords(newLat, newLng);
          showToast('GPS coordinates acquired from device sensor in Jharkhand', 'success');
        },
        (err) => {
          console.warn('[GPS] Geolocation error:', err.message);
          setLat(23.3629);
          setLng(85.3372);
          fetchAddressFromCoords(23.3629, 85.3372);
          showToast('GPS sensor timed out. Set to Ranchi center coordinates.', 'info');
        },
        { timeout: 8000 }
      );
    } else {
      setLat(23.3629);
      setLng(85.3372);
      fetchAddressFromCoords(23.3629, 85.3372);
      showToast('Geolocation not supported by browser. Using default coordinates.', 'info');
    }
  };

  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setRawFiles((prev) => [...prev, ...selected]);
      const newPreviews = selected.map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type.includes('pdf') ? 'pdf' : 'image'
      }));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
      showToast(`${selected.length} evidence file(s) attached and verified`, 'success');
    }
  };

  const removeFile = (index) => {
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declared) {
      showToast('Please confirm the legal declaration before final submission', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build real multipart FormData
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('district', district);
      formData.append('category', category);
      formData.append('submitterType', submitterType);
      formData.append('department', department);
      formData.append(
        'location',
        JSON.stringify({
          lat: Number(lat),
          lng: Number(lng),
          address: address.trim() || `${ward}, ${district}, Jharkhand`
        })
      );

      // Append files with field 'images' matching Multer backend contract
      rawFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await complaintsApi.createComplaint(formData);
      if (res && res.success && res.complaint) {
        const newId = res.complaint._id || res.complaint.id;
        const urn = res.complaint.urn || `SAM-2026-${String(newId).slice(-6).toUpperCase()}`;
        showToast(`Societal Challenge registered successfully! URN: ${urn}`, 'success');
        
        // Navigate directly to the newly created challenge dossier
        navigate(`/complaints/${newId}`);
      } else {
        throw new Error(res?.message || 'Server error creating challenge');
      }
    } catch (err) {
      console.error('[CitizenSubmit] Submission failure:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Submission failed';
      showToast(`Submission failed: ${errorMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>समाधान सेतु — नागरिक नवाचार पोर्टल • SIH-2026 Problem #26043</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Submit Societal Challenge
          </h1>
          <p className="text-sm text-secondary">
            Crowdsource community problems for applied R&D capstones across Jharkhand Higher Education Institutions (HEIs)
          </p>
        </div>

        <button
          onClick={() => navigate('/citizen/complaints')}
          className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface transition-all flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Cancel & Discard</span>
        </button>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { step: 1, label: '1. Submitter & Domain', icon: 'account_tree' },
          { step: 2, label: '2. Problem & AI Triage', icon: 'auto_awesome' },
          { step: 3, label: '3. Geotag & Evidence', icon: 'location_on' },
          { step: 4, label: '4. Legal & Instant URN', icon: 'verified' }
        ].map((s) => {
          const isDone = currentStep > s.step || (submittedComplaint && s.step === 4);
          const isCurrent = currentStep === s.step;
          return (
            <div
              key={s.step}
              onClick={() => !submittedComplaint && setCurrentStep(s.step)}
              className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${
                isCurrent
                  ? 'bg-surface-container-high border-primary text-primary font-bold shadow-sm ring-1 ring-primary/40'
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
        {/* Step 1: Submitter Type & Category */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Step 1: Submitter Persona & Civic Domain
              </h2>
              <p className="text-xs text-secondary">
                Select your institutional role and the sector classification of the grievance
              </p>
            </div>

            {/* Submitter Persona Selector */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2.5">
                Submitter Institutional Classification *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBMITTER_PERSONAS.map((p) => {
                  const isSelected = submitterType === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSubmitterType(p.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-surface-container-high border-primary text-on-surface ring-2 ring-primary/30 shadow-sm'
                          : 'bg-surface-container border-surface-container-highest text-secondary hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="material-symbols-outlined text-primary text-2xl">{p.icon}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-on-surface mb-1">{p.label}</div>
                      <p className="text-[11px] text-secondary leading-snug">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Primary Civic Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Problem Details</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Problem Details & Urgency */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Step 2: Problem Details & Urgency Matrix
              </h2>
              <p className="text-xs text-secondary">
                Describe the specific failure, competent department, and SLA urgency level
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Grievance Title / Problem Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken handpump and groundwater fluoride contamination in Angara"
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Competent Jharkhand State Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary-container outline-none"
              >
                {JHARKHAND_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Triage & Cluster Surge Protocol Notice */}
            <div className="p-4 rounded-2xl bg-surface-container-high/80 border border-primary/30 flex items-start gap-3.5 shadow-sm">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0">auto_awesome</span>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-on-surface block text-sm">
                  Autonomous AI Triage & Cluster Surge Priority
                </span>
                <p className="text-secondary leading-relaxed">
                  Under the SIH26043 framework, resolution priority is determined autonomously by Gemini NLP severity analysis and live 5km spatial density. Multiple reports from the same village/block automatically escalate priority to <strong className="text-primary font-semibold">Community Surge Alert</strong> without manual bias.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                Detailed Narrative & Social Beneficiary Impact *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the municipal failure, number of impacted residents/students, duration of outage, and any local attempts at repair..."
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl p-4 text-on-surface text-sm leading-relaxed focus:border-primary-container outline-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || !description.trim()) {
                    showToast('Title and detailed description are required', 'error');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Geotagging</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Geotagging & Evidence Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Step 3: Interactive GIS Pin & Multipart Evidence
              </h2>
              <p className="text-xs text-secondary">
                Click on the Jharkhand interactive map to reposition the GPS pin, or use your device sensor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Jharkhand District *
                </label>
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

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Ward / Block / Gram Panchayat *
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 12, Angara Block"
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                  Exact Street / Village Landmark Address *
                </label>
                {isGeocoding && (
                  <span className="text-[11px] text-primary flex items-center gap-1 font-semibold animate-pulse">
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                    <span>Resolving address via OSM Nominatim...</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Govt Primary School, Angara Main Road, Ranchi"
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
              />
            </div>

            {/* Leaflet Interactive Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Interactive Coordinate Pin (Click Map to Move Pin)
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-lg text-xs font-bold text-primary flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">my_location</span>
                  <span>Acquire Device GPS</span>
                </button>
              </div>

              <div className="w-full h-64 rounded-2xl overflow-hidden border border-surface-container-highest relative z-0">
                <MapContainer
                  center={[lat, lng]}
                  zoom={11}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler
                    position={[lat, lng]}
                    onPositionChange={(newLat, newLng) => {
                      const rLat = Number(newLat.toFixed(6));
                      const rLng = Number(newLng.toFixed(6));
                      setLat(rLat);
                      setLng(rLng);
                      fetchAddressFromCoords(rLat, rLng);
                      showToast(`Pin moved to: ${rLat.toFixed(4)}, ${rLng.toFixed(4)}`, 'info');
                    }}
                  />
                </MapContainer>
              </div>

              <div className="flex items-center gap-4 text-xs text-secondary font-mono">
                <span>Lat: <strong className="text-on-surface">{lat}</strong></span>
                <span>Lng: <strong className="text-on-surface">{lng}</strong></span>
                {isGeocoding && <span className="text-primary text-[11px] font-sans">Fetching address...</span>}
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                Upload Photo Evidence & Field Documents (Images / PDFs)
              </label>

              <label className="border-2 border-dashed border-surface-container-highest hover:border-primary-container rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-container/50 hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
                <span className="text-xs font-semibold text-on-surface">Click to attach photo or PDF proof</span>
                <span className="text-[11px] text-secondary">Images will be analyzed by Gemini Computer Vision</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {filePreviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {filePreviews.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 bg-surface-container rounded-xl border border-surface-container-highest flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-primary text-base">
                          {f.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                        </span>
                        <span className="text-on-surface font-medium truncate">{f.name}</span>
                        <span className="text-secondary text-[10px]">({f.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-secondary hover:text-red-400 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Review & Submit</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review, Legal Declaration & Instant URN */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-surface-container-highest pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Step 4: Legal Declaration & Submission
              </h2>
              <p className="text-xs text-secondary">
                Confirm your grievance details under official Jharkhand IT & e-Governance statutes
              </p>
            </div>

            {!submittedComplaint ? (
              <div className="space-y-6">
                {/* Review Card */}
                <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-highest space-y-3 text-xs">
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Submitter Classification:</span>
                    <strong className="text-on-surface capitalize">{submitterType}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Category:</span>
                    <strong className="text-on-surface">{category}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Title:</span>
                    <strong className="text-on-surface">{title}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Department:</span>
                    <strong className="text-on-surface">{department}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Urgency / SLA:</span>
                    <strong className="text-primary">{urgency}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-container-highest/60 pb-2">
                    <span className="text-secondary">Location:</span>
                    <strong className="text-on-surface">{address}, {ward}, {district} ({lat}, {lng})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Evidence Attached:</span>
                    <strong className="text-on-surface">{rawFiles.length} file(s)</strong>
                  </div>
                </div>

                {/* Legal Declaration */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container border border-surface-container-highest cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declared}
                    onChange={(e) => setDeclared(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 bg-surface-container-high border-surface-container-highest"
                  />
                  <div className="text-xs text-secondary leading-relaxed">
                    <strong className="text-on-surface">Legal Declaration & Authenticity Guarantee:</strong>{' '}
                    I hereby affirm under penalty of false representation that this civic failure narrative, geotagged coordinate, and photographic evidence are accurate and filed in public interest with the Government of Jharkhand.
                  </div>
                </label>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !declared}
                    className="px-8 py-3.5 bg-primary-container hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Executing AI Triage Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">send</span>
                        <span>Submit to Government Registry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success / Instant URN & Dynamic AI Triage Results */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#003824] text-[#4edea3] border border-[#00b07a] flex items-center justify-center mx-auto shadow-md">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-bold font-mono">
                    URN: {submittedComplaint?._id
                      ? `SAM-2026-${String(submittedComplaint._id).slice(-6).toUpperCase()}`
                      : (submittedComplaint?.urn || 'SAM-2026-REGISTERED')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
                    Grievance Registered Successfully!
                  </h3>
                  <p className="text-xs text-secondary max-w-md mx-auto">
                    Logged in Jharkhand State Master Grievance Registry and queued for AI classification, vector embedding, and academic innovation matching.
                  </p>
                </div>

                {/* AI Triage Card */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-surface-container border border-surface-container-highest text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium">Initial Status:</span>
                    <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-bold capitalize">
                      {submittedComplaint?.status || 'Pending AI Verification'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium">District Registry:</span>
                    <strong className="text-on-surface">{submittedComplaint?.district || district}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium">Auto-Triaged Urgency:</span>
                    <strong className="text-primary capitalize">{submittedComplaint?.urgency || urgency}</strong>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  {submittedComplaint?._id && (
                    <button
                      onClick={() => navigate(`/complaints/${submittedComplaint._id}`)}
                      className="px-6 py-3 bg-primary-container hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <span>View Official Dossier</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/citizen/complaints')}
                    className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-xs font-bold text-secondary hover:text-on-surface rounded-xl transition-all"
                  >
                    Return to Complaints
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
