import React from 'react';
import AdminHeader from '../Admin-User/AdminHeader';
import SystemAdminSidebar from './SystemAdminSidebar';

const SystemAdminLayout = ({ currentSection, onNavigate, onLogout, children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar currentSection={currentSection} onNavigate={onNavigate} />

      <main className="flex-1 flex flex-col">
        <AdminHeader onLogout={onLogout} />
        {children}
      </main>
    </div>
  );
};

export default SystemAdminLayout;
