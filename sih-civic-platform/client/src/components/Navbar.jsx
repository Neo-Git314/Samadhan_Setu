import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { getRoleBadgeInfo, getRoleDefaultRoute } from '../utils/rbac';

function Navbar() {
  const { user, isAuthenticated, logout, switchPersona } = useAuth();
  const { t } = useLanguage();
  const { increaseFont, decreaseFont, resetFont } = useTheme();
  const { unreadCount } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = user?.role || 'citizen';
  const roleBadge = getRoleBadgeInfo(role);

  const unreadNotifications = unreadCount;

  const handleLogout = () => {
    logout();
    showToast(t('logout', 'Signed Out'), 'info');
    navigate('/auth');
  };

  const handleDevRoleSwitch = async (newRole) => {
    try {
      await switchPersona(newRole);
      showToast(`Authenticated as: ${newRole.toUpperCase()}`, 'success');
      navigate(getRoleDefaultRoute(newRole));
    } catch (err) {
      showToast(`Failed to switch persona: ${err.message}`, 'error');
    }
  };

  return (
    <header className="w-full bg-surface-container-lowest border-b border-surface-container-highest z-50 sticky top-0 shadow-lg backdrop-blur-md">
      {/* 1. Official Jharkhand Government Administrative Top Utility Bar */}
      <div className="w-full border-b border-surface-container-highest/60 bg-surface-container-lowest/95">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap justify-between items-center text-xs text-secondary">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-bold text-on-surface">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
              <span>{t('goi_top', 'Government of Jharkhand')}</span>
            </span>
            <span className="hidden md:inline text-surface-container-highest">|</span>
            <span className="hidden md:inline text-xs text-secondary/90">
              {t('ministry_title', 'Department of Information Technology & e-Governance, Govt. of Jharkhand')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Accessibility Font Controls */}
            <div className="flex items-center bg-surface-container rounded-lg px-2.5 py-0.5 gap-2 border border-surface-container-highest">
              <span className="text-[11px] text-secondary font-medium mr-0.5 hidden sm:inline">Text Size:</span>
              <button
                onClick={decreaseFont}
                className="px-1 hover:text-primary transition-colors text-xs font-semibold"
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                onClick={resetFont}
                className="px-1 hover:text-primary transition-colors text-xs font-bold"
                title="Reset Font Size"
              >
                A
              </button>
              <button
                onClick={increaseFont}
                className="px-1 hover:text-primary transition-colors text-xs font-semibold"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-4">
        {/* Portal Brand */}
        <div
          onClick={() => navigate(getRoleDefaultRoute(role))}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-primary-container/40 flex items-center justify-center p-1 text-primary shadow-inner group-hover:border-primary-container transition-all">
            <span className="material-symbols-outlined text-2xl font-bold">
              account_balance
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl tracking-tight text-on-surface font-bold">
                Samadhan Setu
              </span>
              <span className="text-xs bg-primary-container/20 text-primary border border-primary-container/40 px-2 py-0.5 rounded-full font-code-num font-semibold">
                Jharkhand
              </span>
            </div>
            <p className="text-xs text-secondary hidden sm:block">
              {t('sub_brand', 'Government of Jharkhand • Grievance Redressal & Innovation Bridge')}
            </p>
          </div>
        </div>

        {/* Center Role-Filtered Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-3 text-sm font-medium">
          {/* Citizen Routes */}
          {role === 'citizen' && (
            <>
              <NavLink
                to="/citizen/complaints"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary font-bold border border-primary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">inbox</span>
                <span>{t('nav_my_complaints', 'My Complaints')}</span>
              </NavLink>
              <NavLink
                to="/citizen/submit"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary font-bold border border-primary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>{t('nav_register', 'Register Grievance')}</span>
              </NavLink>
            </>
          )}

          {/* University Routes */}
          {role === 'university' && (
            <>
              <NavLink
                to="/university/challenges"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-tertiary-container/20 text-tertiary font-bold border border-tertiary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span>{t('nav_challenges', 'Civic Challenges')}</span>
              </NavLink>
              <NavLink
                to="/university/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-tertiary-container/20 text-tertiary font-bold border border-tertiary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>{t('nav_uni_profile', 'University Profile')}</span>
              </NavLink>
            </>
          )}

          {/* Industry Routes */}
          {role === 'industry' && (
            <>
              <NavLink
                to="/industry/invites"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary font-bold border border-primary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">handshake</span>
                <span>{t('nav_industry_invites', 'Industry Invites')}</span>
              </NavLink>
              <NavLink
                to="/industry/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary font-bold border border-primary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">business</span>
                <span>{t('nav_industry_profile', 'Industry Profile')}</span>
              </NavLink>
            </>
          )}

          {/* Admin Routes */}
          {role === 'admin' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container text-white font-bold shadow-md'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                <span>{t('nav_analytics', 'Analytics & SLA')}</span>
              </NavLink>
              <NavLink
                to="/admin/complaints"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-container/20 text-primary font-bold border border-primary-container/40 shadow-sm'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>{t('nav_admin_matrix', 'Complaint Matrix')}</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Role Indicator & Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-highest transition-colors text-secondary hover:text-on-surface"
            title={t('nav_notifications', 'Notifications')}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-container text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Non-Editable Role Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-surface-container-highest">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${roleBadge.badgeColor}`}
            >
              <span className="material-symbols-outlined text-[16px]">{roleBadge.icon}</span>
              <span>{roleBadge.label}</span>
            </div>
          </div>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-secondary hover:text-error border border-surface-container-highest rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">{t('logout', 'Sign Out')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-primary-container text-white text-xs rounded-xl font-bold hover:bg-orange-600 transition-all shadow flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>{t('signin_btn', 'Officer Console')}</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-surface-container text-secondary hover:text-on-surface"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* 3. Demo Persona Switcher Ribbon */}
      <div className="w-full bg-surface-container-low/80 border-t border-surface-container-highest/60">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-xs text-primary">badge</span>
            <span>{t('active_user', 'Active Session:')}</span>
            <span className="text-on-surface font-semibold">{user?.name || 'Guest'}</span>
            <span className="text-secondary/70 hidden sm:inline">({user?.email})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-secondary text-[11px] hidden md:inline">{t('switch_persona', 'Evaluation Switcher:')}</span>
            <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-surface-container-highest">
              {['citizen', 'university', 'industry', 'admin'].map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => handleDevRoleSwitch(roleKey)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all capitalize ${
                    role === roleKey
                      ? 'bg-primary-container text-white font-bold shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {roleKey}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-surface-container-highest p-4 space-y-3">
          <div className="flex flex-col gap-2">
            {role === 'citizen' && (
              <>
                <NavLink
                  to="/citizen/complaints"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_my_complaints', 'My Complaints')}
                </NavLink>
                <NavLink
                  to="/citizen/submit"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_register', 'Register Grievance')}
                </NavLink>
              </>
            )}
            {role === 'university' && (
              <>
                <NavLink
                  to="/university/challenges"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_challenges', 'Civic Challenges')}
                </NavLink>
                <NavLink
                  to="/university/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_uni_profile', 'University Profile')}
                </NavLink>
              </>
            )}
            {role === 'industry' && (
              <>
                <NavLink
                  to="/industry/invites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_industry_invites', 'Industry Invites')}
                </NavLink>
                <NavLink
                  to="/industry/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_industry_profile', 'Industry Profile')}
                </NavLink>
              </>
            )}
            {role === 'admin' && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_analytics', 'Analytics & SLA')}
                </NavLink>
                <NavLink
                  to="/admin/complaints"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium"
                >
                  {t('nav_admin_matrix', 'Complaint Matrix')}
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
