import React from 'react';
import CalendarLayout from '../../components/Admin-User/CalendarLayout';

const AdminUserCalendarPage = ({ onNavigate }) => {
  const [showTodayTasks, setShowTodayTasks] = React.useState(true);

  const todayTasks = [
    { id: 1, title: 'Study Math', time: '09:00 – 09:30' },
    { id: 2, title: 'Project Meeting', time: '11:00 – 12:00' },
    { id: 3, title: 'Workout', time: '18:00 – 19:00' },
  ];

  return (
    <>
      <CalendarLayout onNavigate={onNavigate} />

      {showTodayTasks && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => setShowTodayTasks(false)}
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="Close today's tasks"
          />

          <div className="relative z-50 max-w-md w-full rounded-2xl bg-white border border-background-dark shadow-lg p-6">
            <button
              type="button"
              onClick={() => setShowTodayTasks(false)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
              aria-label="Close today's tasks"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-heading mb-3">Today's Tasks</h2>
            <div className="space-y-2 text-sm">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-background-dark/60 px-3 py-2 bg-background-soft"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <div>
                      <p className="font-medium text-heading">{task.title}</p>
                      <p className="text-xs text-text-secondary">{task.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTodayTasks(false)}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUserCalendarPage;
