import React from 'react';
import AdminLayout from './AdminLayout';

const AdminDashboardLayout = ({ onNavigate }) => {
  return (
    <AdminLayout currentSection="dashboard" onNavigate={onNavigate}>
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
      </section>
    </AdminLayout>
  );
};

export default AdminDashboardLayout;
