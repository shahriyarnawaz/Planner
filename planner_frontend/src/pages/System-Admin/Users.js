import React from 'react';
import SystemAdminUsersLayout from '../../components/System-Admin/SystemAdminUsersLayout';

const SystemAdminUsersPage = ({ onNavigate, onLogout }) => {
  return <SystemAdminUsersLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default SystemAdminUsersPage;
