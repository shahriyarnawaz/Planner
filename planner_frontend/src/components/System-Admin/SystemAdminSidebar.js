import React from 'react';

const navItems = [
  { id: 'sys_dashboard', label: 'Admin Dashboard' },
  { id: 'sys_users', label: 'User Management' },
  { id: 'sys_templates', label: 'Template Management' },
  { id: 'sys_ml', label: 'ML Monitor & Tune' },
  { id: 'sys_logs', label: 'System Logs & Audit' },
];

const SystemAdminSidebar = ({ currentSection = 'sys_dashboard', onNavigate }) => {
  return (
    <aside className="w-64 bg-cream-dark border-r border-background-dark flex flex-col">
      <div className="px-6 py-5 border-b border-background-dark">
        <div className="text-2xl font-bold text-heading tracking-tight">
          Planner
        </div>
        <div className="text-xs text-text-muted mt-1">System Admin</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm text-text-secondary">
        {navItems.map((item) => {
          const isActive = item.id === currentSection;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'bg-olive text-white shadow-sm'
                  : 'hover:bg-cream-light text-text-secondary'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-background-dark text-xs text-text-muted">
        Signed in as
        <div className="font-medium text-text-primary">superadmin@planner.com</div>
      </div>
    </aside>
  );
};

export default SystemAdminSidebar;
