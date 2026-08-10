import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Dashboards
import BeneficiaryDashboard from './pages/BeneficiaryDashboard';
import FieldOfficerDashboard from './pages/FieldOfficerDashboard';
import FieldMilestoneVerification from './pages/FieldMilestoneVerification';
import DistrictOfficerDashboard from './pages/DistrictOfficerDashboard';
import DistrictMilestoneVerification from './pages/DistrictMilestoneVerification';
import FinanceOfficerDashboard from './pages/FinanceOfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Disbursements from './pages/Disbursements';
import AuditLogs from './pages/AuditLogs';
import AdminReports from './pages/AdminReports';
import Profile from './pages/Profile';

// Pages - Public/Dashboard
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import Apply from './pages/Apply';
import TrackStatus from './pages/TrackStatus';
import UtilizationReport from './pages/UtilizationReport';

// Placeholder Pages for remaining items
const NotFound = () => <div className="container"><h2>404 - Not Found</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with MainLayout (Navbar + Footer) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="all-schemes" element={<Schemes />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard Routes with DashboardLayout (Sidebar Only + Footer) */}
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<BeneficiaryDashboard />} />
          <Route path="field-officer" element={<FieldOfficerDashboard />} />
          <Route path="field-milestone" element={<FieldMilestoneVerification />} />
          <Route path="district-officer" element={<DistrictOfficerDashboard />} />
          <Route path="district-milestone" element={<DistrictMilestoneVerification />} />
          <Route path="finance-officer" element={<FinanceOfficerDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="disbursements" element={<Disbursements />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="profile" element={<Profile />} />

          {/* Moving these pages into the dashboard layout so they only show the sidebar */}
          <Route path="schemes" element={<Schemes />} />
          <Route path="apply" element={<Apply />} />
          <Route path="track-status" element={<TrackStatus />} />
          <Route path="utilization-report" element={<UtilizationReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
