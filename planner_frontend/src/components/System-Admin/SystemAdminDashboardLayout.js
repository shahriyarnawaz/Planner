import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';

const stats = [
  { label: 'Active Users (24h)', value: '128', trend: '+6.4%' },
  { label: 'Tasks Created (24h)', value: '1,342', trend: '+3.1%' },
  { label: 'Tasks Completed (24h)', value: '1,019', trend: '+4.9%' },
  { label: 'Email Delivery', value: '99.2%', trend: '-0.3%' },
];

const commonTasks = [
  { title: 'Study Session', count: 312, category: 'Study' },
  { title: 'Workout', count: 214, category: 'Health' },
  { title: 'Team Meeting', count: 187, category: 'Work' },
  { title: 'Assignment Submission', count: 161, category: 'Study' },
];

const mlSummary = [
  { metric: 'Recommendation CTR', value: '18.4%', note: 'Clicks on suggested tasks/routines' },
  { metric: 'Recurring Detection Accuracy', value: '86%', note: 'Based on manual confirmations' },
  { metric: 'Best-Time Prediction MAE', value: '22 min', note: 'Mean absolute error' },
  { metric: 'Model Errors (24h)', value: '3', note: 'Runtime / inference errors' },
];

const SystemAdminDashboardLayout = ({ onNavigate, onLogout }) => {
  return (
    <SystemAdminLayout currentSection="sys_dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">System Admin Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Usage stats, user activity, common tasks, and ML performance at-a-glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white shadow-sm border border-background-dark p-4">
              <div className="text-xs text-text-muted">{item.label}</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-2xl font-bold text-heading">{item.value}</div>
                <div className="text-xs font-semibold text-text-secondary">{item.trend}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">System Usage</h2>
              <span className="text-xs text-text-muted">Last 7 days</span>
            </div>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">Active users trend</div>
                <div className="mt-3 h-28 rounded-lg bg-white border border-background-dark/60 flex items-center justify-center text-xs text-text-muted">
                  Chart placeholder
                </div>
              </div>
              <div className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">Task throughput</div>
                <div className="mt-3 h-28 rounded-lg bg-white border border-background-dark/60 flex items-center justify-center text-xs text-text-muted">
                  Chart placeholder
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">Common Tasks</h2>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('sys_templates')}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Manage templates
              </button>
            </div>
            <div className="border-t border-background-dark/60 mt-3 mb-3" />

            <div className="space-y-3 text-sm">
              {commonTasks.map((t) => (
                <div key={t.title} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-heading">{t.title}</div>
                    <div className="text-xs text-text-muted">{t.category}</div>
                  </div>
                  <div className="text-xs font-semibold text-text-secondary">{t.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-background-dark p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-heading">ML Performance Summary</h2>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('sys_ml')}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Open ML monitor
            </button>
          </div>
          <div className="border-t border-background-dark/60 mt-3 mb-4" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mlSummary.map((m) => (
              <div key={m.metric} className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">{m.metric}</div>
                <div className="mt-2 text-xl font-bold text-heading">{m.value}</div>
                <div className="mt-1 text-xs text-text-secondary">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SystemAdminLayout>
  );
};

export default SystemAdminDashboardLayout;
