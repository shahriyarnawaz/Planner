import React from 'react';

const AdminHeader = () => {
  const today = new Date().toLocaleDateString();

  return (
    <header className="h-16 border-b border-background-dark bg-white/80 backdrop-blur flex items-center justify-between px-6 lg:px-10">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search tasks, templates..."
            className="w-full rounded-full border border-background-dark bg-background-soft pl-9 pr-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
      </div>

      {/* Right side: Date, Bell, Profile */}
      <div className="ml-4 flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end text-xs text-text-secondary">
          <span className="font-medium text-text-primary">Today</span>
          <span>{today}</span>
        </div>

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-background-dark bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors"
        >
          <span className="text-lg" aria-hidden="true">
            🔔
          </span>
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-gold text-[9px] text-text-primary font-semibold">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-olive-light text-white flex items-center justify-center text-sm font-semibold">
            U
          </div>
          <div className="hidden sm:flex flex-col text-xs leading-tight">
            <span className="font-medium text-text-primary">User Name</span>
            <span className="text-text-muted">Personal Workspace</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
