import React from 'react';
import TaskManagementLayout from '../../components/Admin-User/TaskManagementLayout';

const AdminUserTasksPage = ({ onNavigate, onLogout }) => {
  return <TaskManagementLayout onNavigate={onNavigate} onLogout={onLogout} />;
};

export default AdminUserTasksPage;
