import React from 'react';
import SystemAdminLogsLayout from '../../components/System-Admin/SystemAdminLogsLayout';

const SystemAdminLogsPage = ({ onNavigate, onLogout }) => {
  return <SystemAdminLogsLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default SystemAdminLogsPage;
