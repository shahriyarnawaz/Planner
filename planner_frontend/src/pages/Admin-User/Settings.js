import React from 'react';
import SettingsLayout from '../../components/Admin-User/SettingsLayout';

const AdminUserSettingsPage = ({ onNavigate, onLogout }) => {
  return <SettingsLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default AdminUserSettingsPage;
