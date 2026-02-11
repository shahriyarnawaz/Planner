import React from 'react';
import SystemAdminDashboardLayout from '../../components/System-Admin/SystemAdminDashboardLayout';

const SystemAdminDashboardPage = ({ onNavigate, onLogout }) => {
  return <SystemAdminDashboardLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default SystemAdminDashboardPage;
