import React from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'templates', label: 'Templates' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
];

const AdminSidebar = ({ currentSection = 'dashboard', onNavigate }) => {
  return (
    <aside className="w-64 bg-cream-dark border-r border-background-dark flex flex-col">
      <div className="px-6 py-5 border-b border-background-dark">
        <div className="text-2xl font-bold text-heading tracking-tight">
          Planner
        </div>
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
              {item.id === 'dashboard' && (
                <span className="text-xs">🔔</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-background-dark text-xs text-text-muted">
        Signed in as
        <div className="font-medium text-text-primary">user@example.com</div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
