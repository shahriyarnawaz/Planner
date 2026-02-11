import React from 'react';
import TemplatesLayout from '../../components/Admin-User/TemplatesLayout';

const AdminUserTemplatesPage = ({ onNavigate, onLogout }) => {
  return <TemplatesLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default AdminUserTemplatesPage;
