import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ currentSection, onNavigate, onLogout, children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar currentSection={currentSection} onNavigate={onNavigate} />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <AdminHeader onLogout={onLogout} />
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
