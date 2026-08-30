import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="app" style={{ minHeight: '100vh', background: '#ffffff' }}>
      <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'flex-start' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1, padding: '1.5rem 2rem', background: '#ffffff', minWidth: 0, width: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
