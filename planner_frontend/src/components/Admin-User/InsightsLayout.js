import React from 'react';
import AdminLayout from './AdminLayout';

const InsightsLayout = ({ onNavigate, onLogout }) => {
  // eslint-disable-next-line
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    completionRate: 0,
    categoryData: [],
    weeklyTrends: [],
    recentWeeks: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

  React.useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        const headers = { Authorization: `Bearer ${accessToken}` };

        // Fetch completion rate
        const rateRes = await fetch(`${API_BASE_URL}/tasks/completion-rate/?range=weekly`, { headers });
        let completionRate = 0;
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          completionRate = rateData.completion_rate || 0;
        }

        // Fetch time spent by category
        const catsRes = await fetch(`${API_BASE_URL}/tasks/time-by-category/?range=weekly`, { headers });
        let categoryData = [];
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          categoryData = (catsData.categories || []).map(c => ({
            name: c.label,
            percent: c.percentage,
            time: c.total_time
          }));
        }

        // Fetch weekly trends
        const trendsRes = await fetch(`${API_BASE_URL}/analytics/weekly-trends?weeks=4`, { headers });
        let weeklyTrends = [];
        let recentWeeks = [
          { label: 'This Week', value: 0 },
          { label: 'Last Week', value: 0 },
          { label: 'Average', value: 0 }
        ];

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          const weeks = trendsData.weeks || [];
          
          weeklyTrends = weeks.map(w => ({
            day: w.week_label.split('-W')[1] || w.week_label,
            value: w.completion_rate
          }));

          if (weeks.length > 0) {
            recentWeeks[0].value = weeks[weeks.length - 1].completion_rate; // This week
            if (weeks.length > 1) {
              recentWeeks[1].value = weeks[weeks.length - 2].completion_rate; // Last week
            }
            const arg = weeks.reduce((acc, curr) => acc + curr.completion_rate, 0) / weeks.length;
            recentWeeks[2].value = Math.round(arg);
          }
        }

        setStats({ completionRate, categoryData, weeklyTrends, recentWeeks });
      } catch (err) {
        console.error('Insights fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [API_BASE_URL]);

  const { completionRate, categoryData, weeklyTrends, recentWeeks } = stats;

  let accumulated = 0;
  const pieSegments = categoryData.map((cat) => {
    const start = accumulated;
    const end = accumulated + cat.percent;
    accumulated = end;
    const color =
      cat.name === 'Study'
        ? '#4b6b3c'
        : cat.name === 'Work'
        ? '#8a5b3e'
        : cat.name === 'Health'
        ? '#3b82f6'
        : '#d97757';
    return `${color} ${start}% ${end}%`;
  });
  const pieGradient = `conic-gradient(${pieSegments.join(',')})`;

  const linePoints = weeklyTrends
    .map((point, index) => {
      const total = weeklyTrends.length > 1 ? weeklyTrends.length - 1 : 1;
      const x = (index / total) * 100;
      const y = 40 - (point.value / 100) * 30 - 2;
      return `${x},${y}`;
    })
    .join(' ');

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
                    {categoryData.length === 0 ? (
                      <p className="text-muted text-center italic py-2">No category data yet.</p>
                    ) : (categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                cat.name === 'Study'
                                  ? '#4b6b3c'
                                  : cat.name === 'Work'
                                  ? '#8a5b3e'
                                  : cat.name === 'Health'
                                  ? '#3b82f6'
                                  : '#d97757',
                            }}
                          />
                          <span className="text-body">{cat.name}</span>
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-background-dark/40 mx-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-olive"
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                        <span className="text-text-secondary text-[10px] w-6">{cat.percent}%</span>
                      </div>
                    )))}
                  </div>
                </div>
              </div>

              {/* Weekly Trends */}
              <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 flex flex-col">
                <h2 className="text-sm font-semibold text-heading mb-2">Weekly Completion Trend</h2>
                <p className="text-xs text-text-secondary mb-3">Completion pattern across this week.</p>
                <div className="mt-2 flex flex-col">
                  <div className="h-32 w-full">
                    {weeklyTrends.length === 0 ? (
                      <div className="flex bg-background-soft/30 h-full w-full items-center justify-center border border-dashed border-background-dark rounded-xl">
                        <span className="text-xs text-muted">Not enough data to show trends</span>
                      </div>
                    ) : (
                      <svg
                        viewBox="0 0 100 40"
                        className="w-full h-full text-primary drop-shadow-sm"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                    )}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-text-secondary">
                    {weeklyTrends.map((point) => (
                      <span key={point.day}>{point.day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 max-w-xl">
              <h2 className="text-sm font-semibold text-heading mb-2">Task Completion Rate</h2>
              <p className="text-sm text-body mb-3">Overall this week: {completionRate}%</p>
              <div className="mt-1 flex items-end gap-4 h-32">
                {recentWeeks.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center justify-end group">
                    <div className="relative w-8 md:w-10 h-24 rounded-xl bg-background-dark/20 overflow-hidden flex items-end">
                      <div
                        className="w-full rounded-xl bg-primary transition-all duration-700 ease-out group-hover:bg-primary-dark"
                        style={{ height: `${bar.value}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-text-primary text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
                          {bar.value}%
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 text-[10px] text-text-secondary text-center whitespace-nowrap">{bar.label}</span>
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
