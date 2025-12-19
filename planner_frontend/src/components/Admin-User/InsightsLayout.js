import React from 'react';
import AdminLayout from './AdminLayout';

const categoryData = [
  { name: 'Study', percent: 40 },
  { name: 'Work', percent: 30 },
  { name: 'Health', percent: 20 },
  { name: 'Personal', percent: 10 },
];

const weeklyTrends = [
  { day: 'Mon', value: 70 },
  { day: 'Tue', value: 90 },
  { day: 'Wed', value: 70 },
  { day: 'Thu', value: 85 },
  { day: 'Fri', value: 60 },
];

const completionBars = [
  { label: 'This Week', value: 75 },
  { label: 'Last Week', value: 62 },
  { label: 'Average', value: 68 },
];

const InsightsLayout = ({ onNavigate }) => {
  const completionRate = 75;

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
    <AdminLayout currentSection="insights" onNavigate={onNavigate}>
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
                    {categoryData.map((cat) => (
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
                        <span className="text-text-secondary text-xs">{cat.percent}%</span>
                      </div>
                    ))}
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
                    <div className="relative w-8 md:w-10 h-24 rounded-xl bg-background-dark/20 overflow-hidden flex items-end">
                      <div
                        className="w-full rounded-xl bg-primary"
                        style={{ height: `${bar.value}%` }}
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
