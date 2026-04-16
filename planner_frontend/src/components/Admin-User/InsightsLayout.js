import React from 'react';
import AdminLayout from './AdminLayout';
import { parseApiResponse, extractApiErrorMessage } from '../../utils/safeApiResponse';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
const CATEGORY_COLOR_MAP = {
  study: '#4b6b3c',
  work: '#8a5b3e',
  health: '#3b82f6',
  personal: '#d97757',
  shopping: '#a855f7',
  other: '#6b7280',
};

const InsightsLayout = ({ onNavigate, onLogout }) => {
  const [categoryData, setCategoryData] = React.useState([]);
  const [weeklyTrends, setWeeklyTrends] = React.useState([]);
  const [completionBars, setCompletionBars] = React.useState([
    { label: 'This Week', value: 0 },
    { label: 'Last Week', value: 0 },
    { label: 'Average', value: 0 },
  ]);
  const [completionRate, setCompletionRate] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const toDateKey = React.useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setCategoryData([]);
      setWeeklyTrends([]);
      setCompletionRate(0);
      setCompletionBars([
        { label: 'This Week', value: 0 },
        { label: 'Last Week', value: 0 },
        { label: 'Average', value: 0 },
      ]);
      return;
    }

    const controller = new AbortController();
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - 6);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

        let url = `${API_BASE_URL}/tasks/`;
        const allTasks = [];

        while (url) {
          const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          });
          const { data } = await parseApiResponse(response);
          if (!response.ok) {
            throw new Error(extractApiErrorMessage(response, data, 'Failed to load tasks for insights.'));
          }
          const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
          allTasks.push(...results);
          url = typeof data?.next === 'string' && data.next ? data.next : null;
        }

        const parseTaskDate = (task) => {
          if (!task?.task_date) return null;
          const [yy, mm, dd] = String(task.task_date).split('-').map(Number);
          if (!yy || !mm || !dd) return null;
          const d = new Date(yy, mm - 1, dd);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        const inRange = (date, from, to) => date && date >= from && date <= to;

        const thisWeekTasks = allTasks.filter((t) => inRange(parseTaskDate(t), thisWeekStart, now));
        const lastWeekTasks = allTasks.filter((t) => inRange(parseTaskDate(t), lastWeekStart, lastWeekEnd));

        const categoryMinutes = {};
        let totalMinutes = 0;
        thisWeekTasks.forEach((task) => {
          const key = task.category || 'other';
          const mins = Number(task.duration || 0);
          categoryMinutes[key] = (categoryMinutes[key] || 0) + mins;
          totalMinutes += mins;
        });
        const mappedCategories = Object.entries(categoryMinutes)
          .map(([key, mins]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            percent: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
            color: CATEGORY_COLOR_MAP[key] || '#6b7280',
          }))
          .sort((a, b) => b.percent - a.percent);
        setCategoryData(mappedCategories);

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyTrend = [];
        for (let i = 6; i >= 0; i -= 1) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const nextDay = new Date(day);
          nextDay.setDate(day.getDate() + 1);
          const tasksForDay = allTasks.filter((t) => {
            const d = parseTaskDate(t);
            return d && d >= day && d < nextDay;
          });
          const total = tasksForDay.length;
          const completed = tasksForDay.filter((t) => !!t.completed).length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
          dailyTrend.push({ day: dayLabels[day.getDay()], value: rate });
        }
        setWeeklyTrends(dailyTrend);

        const thisWeekRate =
          thisWeekTasks.length > 0
            ? Number(((thisWeekTasks.filter((t) => !!t.completed).length / thisWeekTasks.length) * 100).toFixed(2))
            : 0;
        const lastWeekRate =
          lastWeekTasks.length > 0
            ? Number(((lastWeekTasks.filter((t) => !!t.completed).length / lastWeekTasks.length) * 100).toFixed(2))
            : 0;
        const avgRate = Number(((thisWeekRate + lastWeekRate) / 2).toFixed(2));
        setCompletionRate(thisWeekRate);
        setCompletionBars([
          { label: 'This Week', value: thisWeekRate },
          { label: 'Last Week', value: lastWeekRate },
          { label: 'Average', value: avgRate },
        ]);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setCategoryData([]);
        setWeeklyTrends([]);
        setCompletionRate(0);
        setCompletionBars([
          { label: 'This Week', value: 0 },
          { label: 'Last Week', value: 0 },
          { label: 'Average', value: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    return () => controller.abort();
  }, []);

  let accumulated = 0;
  const pieSegments = categoryData.map((cat) => {
    const start = accumulated;
    const end = accumulated + cat.percent;
    accumulated = end;
    const color = cat.color || '#6b7280';
    return `${color} ${start}% ${end}%`;
  });
  const pieGradient = pieSegments.length > 0 ? `conic-gradient(${pieSegments.join(',')})` : 'conic-gradient(#d1d5db 0% 100%)';

  const linePoints = weeklyTrends
    .map((point, index) => {
      const total = weeklyTrends.length > 1 ? weeklyTrends.length - 1 : 1;
      const x = (index / total) * 100;
      const y = 40 - (point.value / 100) * 30 - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const getCompletionBarColorClass = (value) => {
    if (value >= 75) return 'bg-primary';
    if (value >= 40) return 'bg-warning';
    if (value > 0) return 'bg-danger-light';
    return 'bg-transparent';
  };

  return (
    <AdminLayout currentSection="insights" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
        <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-heading">Insights</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Understand how you spend your time across categories and days.
                </p>
              </div>
            </div>

            {loading && (
              <div className="mb-4 rounded-xl border border-background-dark/60 bg-white px-3 py-2 text-xs text-body">
                Loading insights...
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Time Spent Per Category */}
              <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 flex flex-col">
                <h2 className="text-sm font-semibold text-heading mb-2">Time Spent Per Category</h2>
                <div className="flex flex-1 flex-col md:flex-row md:items-center gap-4 mt-1">
                  {/* Donut chart placeholder */}
                  <div className="flex items-center justify-center md:w-1/2">
                    <div
                      className="relative h-32 w-32 rounded-full border border-background-dark/60"
                      style={{ backgroundImage: pieGradient }}
                    >
                      <div className="absolute inset-4 rounded-full bg-background-soft flex items-center justify-center">
                        <span className="text-xs text-text-secondary text-center">
                          Time
                          <br />
                          by Category
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="md:w-1/2 space-y-2 text-xs md:text-sm">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color || '#6b7280' }}
                          />
                          <span className="text-body">{cat.name}</span>
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-background-dark/40 mx-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-olive"
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                        <span className="text-text-secondary text-xs">{cat.percent}%</span>
                      </div>
                    ))}
                    {!loading && categoryData.length === 0 && (
                      <p className="text-xs text-muted">No category history yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Trends */}
              <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 flex flex-col">
                <h2 className="text-sm font-semibold text-heading mb-2">Weekly Completion Trend</h2>
                <p className="text-xs text-text-secondary mb-3">Completion pattern across this week.</p>
                <div className="mt-2 flex flex-col">
                  <div className="h-32 w-full">
                    <svg
                      viewBox="0 0 100 40"
                      className="w-full h-full text-primary"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        points={linePoints}
                      />
                      {weeklyTrends.map((point, index) => {
                        const total = weeklyTrends.length > 1 ? weeklyTrends.length - 1 : 1;
                        const x = (index / total) * 100;
                        const y = 40 - (point.value / 100) * 30 - 2;
                        return (
                          <circle key={point.day} cx={x} cy={y} r={1.8} fill="currentColor" />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-text-secondary">
                    {weeklyTrends.map((point) => (
                      <span key={point.day}>{point.day}</span>
                    ))}
                  </div>
                  {!loading && weeklyTrends.length === 0 && (
                    <p className="mt-2 text-xs text-muted">No weekly trend data yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 max-w-xl">
              <h2 className="text-sm font-semibold text-heading mb-2">Task Completion Rate</h2>
              <p className="text-sm text-body mb-3">Overall this week: {completionRate}%</p>
              <div className="mt-1 flex items-end gap-4 h-32">
                {completionBars.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center justify-end">
                    <div className="relative w-8 md:w-10 h-24 rounded-xl bg-background-dark/70 overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-xl ${getCompletionBarColorClass(bar.value)}`}
                        style={{ height: `${Math.max(0, Math.min(100, Number(bar.value) || 0))}%` }}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-text-secondary text-center">{bar.label}</span>
                    <span className="mt-0.5 text-[11px] font-medium text-heading">{bar.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    </AdminLayout>
  );
};

export default InsightsLayout;
