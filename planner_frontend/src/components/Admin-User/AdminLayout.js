import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ currentSection, onNavigate, children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar currentSection={currentSection} onNavigate={onNavigate} />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <AdminHeader />
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
