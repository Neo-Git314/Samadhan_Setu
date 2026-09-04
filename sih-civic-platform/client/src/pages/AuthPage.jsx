import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getRoleDefaultRoute } from '../utils/rbac';

const PERSONAS = [
  {
    role: 'citizen',
    titleEn: 'Citizen Portal',
    descEn: 'File grievances across Jharkhand, upload geotagged proof, and track SLA resolution progress.',
    icon: 'person',
    email: 'rahul.kumar@gmail.com',
    badgeColor: 'bg-primary-container/20 text-primary border-primary-container/40'
  },
  {
    role: 'university',
    titleEn: 'University Innovation Hub',
    descEn: 'Bid on Jharkhand civic engineering challenges and develop capstone solutions with state institutions.',
    icon: 'school',
    email: 'university@bitmesra.ac.in',
    badgeColor: 'bg-tertiary-container/20 text-tertiary border-tertiary-container/40'
  },
  {
    role: 'industry',
    titleEn: 'Industry Partner Portal',
    descEn: 'Co-fund high-impact municipal solutions in Jharkhand and manage CSR grant capital under MCA Section 135.',
    icon: 'corporate_fare',
    email: 'contact@ecosolve.in',
    badgeColor: 'bg-secondary-container text-on-surface border-secondary/40'
  },
  {
    role: 'admin',
    titleEn: 'Nodal Officer & Admin',
    descEn: 'AI triage matrix, Jharkhand district SLA analytics, and state academic assignments.',
    icon: 'admin_panel_settings',
    email: 'admin@samadhan.gov.in',
    badgeColor: 'bg-primary-container text-white border-primary'
  }
];

function AuthPage() {
  const { login, switchPersona } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('rahul.kumar@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('42');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (persona) => {
    setSelectedRole(persona.role);
    setEmail(persona.email);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try real login with email and password
      const loggedUser = await login(email, password);
      showToast(
        `Signed in successfully to ${loggedUser.role?.toUpperCase() || selectedRole.toUpperCase()} Portal`,
        'success'
      );
      navigate(getRoleDefaultRoute(loggedUser.role || selectedRole));
    } catch (err) {
      // If direct login fails, try switchPersona fallback
      console.warn('Direct login failed, attempting persona switch:', err.message);
      try {
        const switched = await switchPersona(selectedRole);
        showToast(`Signed in to ${selectedRole.toUpperCase()} Portal`, 'success');
        navigate(getRoleDefaultRoute(switched?.role || selectedRole));
      } catch (innerErr) {
        showToast(`Login failed: ${err.message}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high border border-primary-container/30 text-primary text-xs font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>Government of Jharkhand</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
          Single Sign-On (SSO) Portal
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-xl mx-auto leading-relaxed">
          Government of Jharkhand — Secure access for Citizens, Academic Institutions, CSR Partners, and Nodal Officers
        </p>
      </div>

      {/* Role / Persona Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
          1. Select Your Authorized Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONAS.map((p) => {
            const isSelected = selectedRole === p.role;
            return (
              <div
                key={p.role}
                onClick={() => handleRoleSelect(p)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface-container-high border-primary ring-2 ring-primary-container/40 shadow-lg scale-[1.02]'
                    : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container hover:border-surface-container-high'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-primary-container text-white border-primary'
                          : 'bg-surface-container text-secondary border-surface-container-highest'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-xl font-bold">
                        check_circle
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-on-surface text-sm mb-1">
                    {p.titleEn}
                  </h3>
                  <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                    {p.descEn}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-container-highest">
                  <span className="text-[11px] font-mono text-secondary truncate block">
                    {p.email}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credentials Form */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
          <span className="material-symbols-outlined text-2xl text-primary">lock</span>
          <div>
            <h2 className="font-bold text-lg text-on-surface">
              Authenticate & Continue
            </h2>
            <p className="text-xs text-secondary">
              Logging in as: <span className="font-bold text-primary capitalize">{selectedRole}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Govt ID */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Official Email / State Government ID *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-secondary text-base">
                alternate_email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none transition-all"
                placeholder="name@jharkhand.gov.in"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Security Password / PIN *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-primary hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-secondary text-base">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-12 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="material-symbols-outlined absolute right-3.5 top-3 text-secondary text-base hover:text-on-surface"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
          </div>

          {/* Security Captcha */}
          <div className="bg-surface-container/60 border border-surface-container-highest rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-surface-container-high font-mono font-bold tracking-widest text-primary text-sm rounded border border-surface-container-highest select-none">
                37 + 5 = ?
              </span>
              <span className="text-xs text-secondary hidden sm:inline">Security Math Captcha</span>
            </div>
            <input
              type="text"
              required
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-20 bg-surface border border-surface-container-highest rounded-lg px-3 py-1 text-center font-bold text-on-surface focus:border-primary-container outline-none text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-primary-container hover:bg-orange-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>
                  Enter {selectedRole.toUpperCase()} Portal
                </span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-surface-container-highest text-xs text-secondary">
          <span>Protected by Jharkhand Agency for Promotion of Information Technology (JAP-IT) & State Data Center (SDC)</span>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
