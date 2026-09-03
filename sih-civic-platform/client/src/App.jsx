import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import CitizenSubmit from './pages/CitizenSubmit';
import CitizenComplaints from './pages/CitizenComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import UniChallenges from './pages/UniChallenges';
import UniProjectDetail from './pages/UniProjectDetail';
import UniversityProfile from './pages/UniversityProfile';
import IndustryInvites from './pages/IndustryInvites';
import IndustryProfile from './pages/IndustryProfile';
import Notifications from './pages/Notifications';
import AdminComplaints from './pages/AdminComplaints';
import AdminDashboard from './pages/AdminDashboard';

// TODO: Expand route guards and role-specific navigation flows.
function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl p-4">
        <Routes>
          <Route path="/" element={<CitizenComplaints />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/citizen/submit" element={<CitizenSubmit />} />
          <Route path="/citizen/complaints" element={<CitizenComplaints />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/university/challenges" element={<UniChallenges />} />
          <Route path="/university/projects/:id" element={<UniProjectDetail />} />
          <Route path="/university/profile" element={<UniversityProfile />} />
          <Route path="/industry/invites" element={<IndustryInvites />} />
          <Route path="/industry/profile" element={<IndustryProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
