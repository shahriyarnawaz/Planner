import React from 'react';
import AdminLayout from './AdminLayout';

const AdminDashboardLayout = ({ onNavigate }) => {
  return (
    <AdminLayout currentSection="dashboard" onNavigate={onNavigate}>
      {/* Dashboard Home Content */}
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading flex items-center gap-2">
            <span>Good Morning, Shahriyar</span>
            <span className="text-xl">👋</span>
          </h1>
        </div>

        {/* Today's Progress Bar */}
        <div className="mb-8 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-heading">Today's Progress</h2>
            <span className="text-xs font-medium text-body">45%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-background-dark/60 overflow-hidden">
            <div className="h-full w-[45%] rounded-full bg-accent-gold" />
          </div>
        </div>

        {/* Main content: Today's Tasks + Smart Suggestions */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Today's Task List (with priority icons) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-3">Today's Tasks</h2>
            <div className="border-t border-background-dark/60 mb-3" />
            <div className="space-y-3 text-sm text-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-heading flex items-center gap-2">
                    <span className="text-xs">🔴</span>
                    <span>Study Math</span>
                  </p>
                  <p className="text-xs text-text-secondary">09:00 – 09:30</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                  <span className="text-[9px]">⬤</span>
                  <span>High</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-heading flex items-center gap-2">
                    <span className="text-xs">🟡</span>
                    <span>Project Meeting</span>
                  </p>
                  <p className="text-xs text-text-secondary">11:00 – 12:00</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-yellow-700">
                  <span className="text-[9px]">⬤</span>
                  <span>Medium</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-heading flex items-center gap-2">
                    <span className="text-xs">🟢</span>
                    <span>Workout</span>
                  </p>
                  <p className="text-xs text-text-secondary">18:00 – 19:00</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  <span className="text-[9px]">⬤</span>
                  <span>Low</span>
                </span>
              </div>
            </div>
          </div>

          {/* Smart Suggestions Panel (ML based) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-2">Smart Suggestions</h2>
            <p className="text-xs text-muted mb-3">
              ML-based suggestions tailored from your recent study and work patterns.
            </p>
            <div className="space-y-3 text-sm text-body">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">✨</span>
                <p>
                  <span className="font-medium">Convert "Study Math" into a daily recurring task at 8 PM.</span>
                  <br />
                  <span className="text-xs text-text-secondary">Based on your last 5 days of activity.</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5">🧠</span>
                <p>
                  <span className="font-medium">Add a short review block after your Project Meeting.</span>
                  <br />
                  <span className="text-xs text-text-secondary">Helps capture decisions while they are fresh.</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5">⚡</span>
                <p>
                  <span className="font-medium">Move Workout 30 minutes earlier.</span>
                  <br />
                  <span className="text-xs text-text-secondary">Aligns better with your typical evening focus window.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardLayout;
