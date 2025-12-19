import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminDashboardLayout = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar currentSection="dashboard" onNavigate={onNavigate} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <AdminHeader />

        {/* Dashboard Home Content */}
        <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
          {/* Greeting + Today */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted mb-1">Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-bold text-heading flex items-center gap-2">
                <span>Good Morning, Shahriyar</span>
                <span className="text-xl">👋</span>
              </h1>
            </div>
            <div className="text-sm text-body">
              <span className="font-medium">Today:</span>{' '}
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Today stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4">
              <p className="text-xs text-muted mb-1">Tasks Today</p>
              <p className="text-2xl font-bold text-heading">5</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4">
              <p className="text-xs text-muted mb-1">Completed</p>
              <p className="text-2xl font-bold text-heading">2</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4">
              <p className="text-xs text-muted mb-1">Pending</p>
              <p className="text-2xl font-bold text-heading">3</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8 max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-heading">Progress</h2>
              <span className="text-xs font-medium text-body">45%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-background-dark/60 overflow-hidden">
              <div className="h-full w-[45%] rounded-full bg-accent-gold" />
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5 max-w-xl">
            <h2 className="text-sm font-semibold text-heading mb-3">Upcoming Tasks</h2>
            <div className="border-t border-background-dark/60 mb-3" />
            <div className="space-y-3 text-sm text-body">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">⏰</span>
                <p>
                  <span className="font-medium">09:00</span>{' '}
                  – Study (Math)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">⏰</span>
                <p>
                  <span className="font-medium">11:00</span>{' '}
                  – Project Meeting
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">⏰</span>
                <p>
                  <span className="font-medium">18:00</span>{' '}
                  – Workout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-xl rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="text-xl mt-0.5">🔁</div>
              <div className="flex-1 text-sm text-body">
                <h2 className="text-sm font-semibold text-heading mb-1">Recurring Task Detected</h2>
                <p>You studied "Math" at 8 PM for the last 5 days.</p>
                <p className="mt-1">Would you like to make this a daily task?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Make Recurring
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-background-dark px-4 py-1.5 text-xs font-semibold text-heading bg-background-soft hover:bg-background-dark/40 transition-colors duration-150"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
