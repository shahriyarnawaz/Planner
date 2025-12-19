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

const InsightsLayout = ({ onNavigate }) => {
  const completionRate = 75;

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
                    <div className="relative h-32 w-32 rounded-full border-[10px] border-olive/70">
                      <div className="absolute inset-3 rounded-full bg-background-soft flex items-center justify-center">
                        <span className="text-xs text-text-secondary text-center">
                          Focus
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
                <h2 className="text-sm font-semibold text-heading mb-2">Weekly Productivity</h2>
                <p className="text-xs text-text-secondary mb-3">How consistent you were this week.</p>
                <div className="space-y-2 text-xs md:text-sm">
                  {weeklyTrends.map((day) => (
                    <div key={day.day} className="flex items-center gap-2">
                      <span className="w-10 text-text-secondary">{day.day}</span>
                      <div className="flex-1 h-2 rounded-full bg-background-dark/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${day.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 max-w-xl">
              <h2 className="text-sm font-semibold text-heading mb-2">Completion Rate</h2>
              <p className="text-sm text-body mb-2">Completed Tasks: {completionRate}%</p>
              <div className="h-3 w-full rounded-full bg-background-dark/40 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-olive"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>✔ Based on completed vs created</li>
                <li>✔ Missed tasks affect rate</li>
              </ul>
            </div>
          </div>
        </section>
    </AdminLayout>
  );
};

export default InsightsLayout;
