import React from 'react';
import InsightsLayout from '../../components/Admin-User/InsightsLayout';

const AdminUserInsightsPage = ({ onNavigate, onLogout }) => {
  return <InsightsLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default AdminUserInsightsPage;
