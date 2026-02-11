import React from 'react';
import AdminDashboardLayout from '../../components/Admin-User/AdminDashboardLayout';

const AdminUserDashboardPage = ({ onNavigate, onLogout }) => {
  return <AdminDashboardLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default AdminUserDashboardPage;
