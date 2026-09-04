import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import CitizenComplaints from './pages/CitizenComplaints';
import CitizenSubmit from './pages/CitizenSubmit';
import ComplaintDetail from './pages/ComplaintDetail';
import UniChallenges from './pages/UniChallenges';
import UniProjectDetail from './pages/UniProjectDetail';
import UniversityProfile from './pages/UniversityProfile';
import IndustryInvites from './pages/IndustryInvites';
import IndustryProfile from './pages/IndustryProfile';
import Notifications from './pages/Notifications';
import AdminComplaints from './pages/AdminComplaints';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col selection:bg-primary-container selection:text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-200">
        <Routes>
          {/* Default Root Redirect */}
          <Route path="/" element={<Navigate to="/citizen/complaints" replace />} />

          {/* Authentication & Persona Login */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Citizen Portal (Strictly for Citizen) */}
          <Route
            path="/citizen/complaints"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/submit"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenSubmit />
              </ProtectedRoute>
            }
          />

          {/* Shared Complaint Detail (Citizen, Admin, University) */}
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'university']}>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* University Portal (Strictly for University) */}
          <Route
            path="/university/challenges"
            element={
              <ProtectedRoute allowedRoles={['university']}>
                <UniChallenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/projects/:id"
            element={
              <ProtectedRoute allowedRoles={['university', 'industry']}>
                <UniProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/profile"
            element={
              <ProtectedRoute allowedRoles={['university']}>
                <UniversityProfile />
              </ProtectedRoute>
            }
          />

          {/* Industry Portal (Strictly for Industry) */}
          <Route
            path="/industry/invites"
            element={
              <ProtectedRoute allowedRoles={['industry']}>
                <IndustryInvites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industry/profile"
            element={
              <ProtectedRoute allowedRoles={['industry']}>
                <IndustryProfile />
              </ProtectedRoute>
            }
          />

          {/* Common Notifications (All Roles) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'university', 'industry', 'admin']}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal (Strictly for Admin) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </main>

      {/* Official Jharkhand Government Digital Portal Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-highest/60 py-6 text-xs text-secondary mt-auto">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">verified</span>
            <span className="font-medium text-on-surface">Samadhan Setu — Government of Jharkhand | Department of IT & e-Governance (JAP-IT)</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 text-secondary/80">
            <span>Jharkhand State Data Center (SDC)</span>
            <span>•</span>
            <span>ISO 27001 Certified Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
