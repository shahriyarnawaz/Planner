import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';
import { parseApiResponse } from '../../utils/safeApiResponse';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const defaultStats = [
  { label: 'All Users', value: '--', trend: 'Live' },
  { label: 'Tasks Created (24h)', value: '--', trend: 'Live' },
  { label: 'Tasks Completed (24h)', value: '--', trend: 'Live' },
  { label: 'Email Delivery', value: '--', trend: 'Live' },
];

const mlSummary = [
  { metric: 'Recommendation CTR', value: '18.4%', note: 'Clicks on suggested tasks/routines' },
  { metric: 'Recurring Detection Accuracy', value: '86%', note: 'Based on manual confirmations' },
  { metric: 'Best-Time Prediction MAE', value: '22 min', note: 'Mean absolute error' },
  { metric: 'Model Errors (24h)', value: '3', note: 'Runtime / inference errors' },
];

const SystemAdminDashboardLayout = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = React.useState(defaultStats);
  const [usageDaily, setUsageDaily] = React.useState([]);
  const [commonTasks, setCommonTasks] = React.useState([]);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const controller = new AbortController();

    const loadDashboardStats = async () => {
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/admin/stats/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        const { data } = await parseApiResponse(statsResponse);
        if (!statsResponse.ok) return;

        const apiStats = data?.statistics || {};
        const allUsersCount = Number(apiStats?.total_users || 0);
        const tasksCreated24h = Number(apiStats?.tasks_created_24h || 0);
        const tasksCompleted24h = Number(apiStats?.tasks_completed_24h || 0);
        const emailNotifications24h = Number(apiStats?.email_notifications_24h?.total || 0);

        setStats((prev) => {
          const next = [...prev];
          next[0] = {
            ...next[0],
            label: 'All Users',
            value: String(allUsersCount),
            trend: 'Live',
          };
          next[1] = {
            ...next[1],
            value: String(tasksCreated24h),
            trend: 'Live',
          };
          next[2] = {
            ...next[2],
            value: String(tasksCompleted24h),
            trend: 'Live',
          };
          next[3] = {
            ...next[3],
            value: String(emailNotifications24h),
            label: 'Emails Sent (24h)',
            trend: 'Live',
          };
          return next;
        });

        const usageResponse = await fetch(`${API_BASE_URL}/admin/system-usage/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        const { data: usageData } = await parseApiResponse(usageResponse);
        if (usageResponse.ok) {
          const usagePayload = usageData?.usage || {};
          setUsageDaily(Array.isArray(usagePayload?.daily) ? usagePayload.daily : []);
          setCommonTasks(Array.isArray(usagePayload?.common_tasks) ? usagePayload.common_tasks : []);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    };

    loadDashboardStats();
    return () => controller.abort();
  }, []);

  const usageChartData = React.useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return usageDaily.map((item) => {
      const d = item?.date ? new Date(item.date) : null;
      const day = d && !Number.isNaN(d.getTime()) ? dayNames[d.getDay()] : '--';
      return {
        day,
        activeUsers: Number(item?.active_users || 0),
        tasksCreated: Number(item?.tasks_created || 0),
        tasksCompleted: Number(item?.tasks_completed || 0),
      };
    });
  }, [usageDaily]);

  const activeUsersPoints = React.useMemo(() => {
    if (usageChartData.length === 0) return '';
    const maxValue = Math.max(1, ...usageChartData.map((p) => p.activeUsers));
    return usageChartData
      .map((point, index) => {
        const total = usageChartData.length > 1 ? usageChartData.length - 1 : 1;
        const x = (index / total) * 100;
        const y = 40 - (point.activeUsers / maxValue) * 30 - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [usageChartData]);

  const throughputPointsCreated = React.useMemo(() => {
    if (usageChartData.length === 0) return '';
    const maxValue = Math.max(1, ...usageChartData.map((p) => Math.max(p.tasksCreated, p.tasksCompleted)));
    return usageChartData
      .map((point, index) => {
        const total = usageChartData.length > 1 ? usageChartData.length - 1 : 1;
        const x = (index / total) * 100;
        const y = 40 - (point.tasksCreated / maxValue) * 30 - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [usageChartData]);

  const throughputPointsCompleted = React.useMemo(() => {
    if (usageChartData.length === 0) return '';
    const maxValue = Math.max(1, ...usageChartData.map((p) => Math.max(p.tasksCreated, p.tasksCompleted)));
    return usageChartData
      .map((point, index) => {
        const total = usageChartData.length > 1 ? usageChartData.length - 1 : 1;
        const x = (index / total) * 100;
        const y = 40 - (point.tasksCompleted / maxValue) * 30 - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [usageChartData]);

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
                <div className="mt-3 h-28 rounded-lg bg-white border border-background-dark/60 p-2">
                  {usageChartData.length > 0 ? (
                    <>
                      <svg viewBox="0 0 100 40" className="w-full h-[75%] text-primary" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          points={activeUsersPoints}
                        />
                      </svg>
                      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
                        {usageChartData.map((point) => (
                          <span key={`active-${point.day}`}>{point.day}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-muted">No usage data yet.</div>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">Task throughput</div>
                <div className="mt-3 h-28 rounded-lg bg-white border border-background-dark/60 p-2">
                  {usageChartData.length > 0 ? (
                    <>
                      <svg viewBox="0 0 100 40" className="w-full h-[75%]" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#4b6b3c"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          points={throughputPointsCreated}
                        />
                        <polyline
                          fill="none"
                          stroke="#d97757"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          points={throughputPointsCompleted}
                        />
                      </svg>
                      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
                        {usageChartData.map((point) => (
                          <span key={`throughput-${point.day}`}>{point.day}</span>
                        ))}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-text-secondary">
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-olive" />
                          Created
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-danger-light" />
                          Completed
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-text-muted">No throughput data yet.</div>
                  )}
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
              {commonTasks.map((t, idx) => (
                <div key={`${t.title}-${t.category}-${idx}`} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-heading">{t.title}</div>
                    <div className="text-xs text-text-muted">
                      {String(t.category || '').charAt(0).toUpperCase() + String(t.category || '').slice(1)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-text-secondary">{t.count}</div>
                </div>
              ))}
              {commonTasks.length === 0 && (
                <p className="text-xs text-text-muted">No common tasks data yet.</p>
              )}
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
