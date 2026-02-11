import React from 'react';
import SystemAdminTemplatesLayout from '../../components/System-Admin/SystemAdminTemplatesLayout';

const SystemAdminTemplatesPage = ({ onNavigate, onLogout }) => {
  return <SystemAdminTemplatesLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default SystemAdminTemplatesPage;
