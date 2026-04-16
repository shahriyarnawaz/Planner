import React from 'react';
import AdminLayout from '../../components/Admin-User/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const AdminUserCalendarPage = ({ onNavigate }) => {
  const [viewMode, setViewMode] = React.useState('month');
  const [showTodayTasks, setShowTodayTasks] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [tasksLoading, setTasksLoading] = React.useState(false);
  const [tasksError, setTasksError] = React.useState('');

  const formatDateKeyLocal = React.useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [todayKey] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Current month and week anchors for navigation
  const [currentMonthDate, setCurrentMonthDate] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  });

  const [currentWeekStart, setCurrentWeekStart] = React.useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek + 6) % 7; // Monday as start of week
    const start = new Date(today);
    start.setDate(today.getDate() - diff);
    return start;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;

  const formatHumanDate = (dateKey) => {
    if (!dateKey) return '';
    const [year, month, day] = dateKey.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  };

  const formatTimeTo12 = (value) => {
    if (!value || typeof value !== 'string') return '';
    const m24 = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (!m24) return value;
    const hh = Number(m24[1]);
    const mm = m24[2];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
  };

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTasks([]);
      setTasksError('You must be logged in to view calendar tasks.');
      return;
    }

    const controller = new AbortController();
    const fetchTasks = async () => {
      setTasksLoading(true);
      setTasksError('');
      try {
        let url = `${API_BASE_URL}/tasks/`;
        const allTasks = [];

        while (url) {
          const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || data?.detail || 'Failed to load calendar tasks.');
          }

          const page = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
          allTasks.push(...page);
          url = typeof data?.next === 'string' && data.next ? data.next : null;
        }

        const mappedTasks = allTasks
          .filter((task) => !!task.task_date)
          .map((task) => ({
            id: task.id,
            title: task.title,
            date: task.task_date,
            time:
              task.start_time && task.end_time
                ? `${formatTimeTo12(task.start_time)} – ${formatTimeTo12(task.end_time)}`
                : task.deadline || '--',
            completed: !!task.completed,
          }));

        setTasks(mappedTasks);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setTasks([]);
        setTasksError(err.message || 'Something went wrong while loading calendar tasks.');
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
    return () => controller.abort();
  }, []);

  const weekRangeLabel = React.useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(start.getDate() + 6);

    const startKey = formatDateKeyLocal(start);
    const endKey = formatDateKeyLocal(end);
    return `${formatHumanDate(startKey)} – ${formatHumanDate(endKey)}`;
  }, [currentWeekStart, formatDateKeyLocal]);

  const getTasksForDate = (dateKey) => tasks.filter((task) => task.date === dateKey);

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + 1);
      return d;
    });
  };

  const handleResetMonth = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    setCurrentMonthDate(d);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
  };

  const handleResetWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - diff);
    setCurrentWeekStart(start);
  };

  // Build a month grid for the current (navigated) month (Mon-Sun)
  const monthGrid = React.useMemo(() => {
    const base = new Date(currentMonthDate);
    base.setHours(0, 0, 0, 0);
    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const first = new Date(year, monthIndex, 1);
    const startWeekday = (first.getDay() + 6) % 7; // convert Sunday-based to Monday-based index
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const weeks = [];
    let day = 1 - startWeekday;

    while (day <= daysInMonth) {
      const week = [];
      for (let i = 0; i < 7; i += 1, day += 1) {
        if (day < 1 || day > daysInMonth) {
          week.push(null);
        } else {
          const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          week.push({ day, dateKey });
        }
      }
      weeks.push(week);
    }

    return weeks;
  }, [currentMonthDate]);

  // Weekly view for the current (navigated) week (starting Monday)
  const weekDays = React.useMemo(() => {
    const result = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const start = new Date(currentWeekStart);

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;
      result.push({
        dateKey,
        label: d.getDate(),
        weekday: weekdayNames[d.getDay()],
      });
    }

    return result;
  }, [currentWeekStart]);

  const todayTasks = getTasksForDate(todayKey);
  const tasksForSelectedDay = selectedDay ? getTasksForDate(selectedDay) : [];

  return (
    <>
      <AdminLayout currentSection="calendar" onNavigate={onNavigate}>
        <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
          {/* Header + view toggle + navigation */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-heading">Calendar</h1>
            <div className="flex flex-col items-stretch md:items-end gap-2">
              <div className="inline-flex items-center rounded-full border border-background-dark/70 bg-background-soft p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                    viewMode === 'month'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-body hover:bg-background-dark/40'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                    viewMode === 'week'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-body hover:bg-background-dark/40'
                  }`}
                >
                  Week
                </button>
              </div>

              {viewMode === 'month' ? (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-body">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="h-7 w-7 rounded-full border border-background-dark/60 flex items-center justify-center hover:bg-background-dark/40"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleResetMonth}
                    className="px-3 py-1 rounded-full border border-background-dark/70 bg-background-soft text-xs font-semibold hover:bg-background-dark/40"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="h-7 w-7 rounded-full border border-background-dark/60 flex items-center justify-center hover:bg-background-dark/40"
                    aria-label="Next month"
                  >
                    ›
                  </button>
                  <span className="ml-2 font-medium text-heading">{monthLabel}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-body">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="h-7 w-7 rounded-full border border-background-dark/60 flex items-center justify-center hover:bg-background-dark/40"
                    aria-label="Previous week"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleResetWeek}
                    className="px-3 py-1 rounded-full border border-background-dark/70 bg-background-soft text-xs font-semibold hover:bg-background-dark/40"
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="h-7 w-7 rounded-full border border-background-dark/60 flex items-center justify-center hover:bg-background-dark/40"
                    aria-label="Next week"
                  >
                    ›
                  </button>
                  <span className="ml-2 font-medium text-heading">{weekRangeLabel}</span>
                </div>
              )}
            </div>
          </div>

          {tasksError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {tasksError}
            </div>
          )}
          {tasksLoading && (
            <div className="mb-3 rounded-lg border border-background-dark/60 bg-white px-3 py-2 text-xs text-body">
              Loading calendar tasks...
            </div>
          )}

          {/* Calendar views */}
          {viewMode === 'month' ? (
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-4 md:p-5">
              {/* Weekday header */}
              <div className="grid grid-cols-7 text-[11px] md:text-xs font-semibold text-muted mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs">
                {monthGrid.map((week, wi) =>
                  week.map((cell, ci) => {
                    if (!cell) {
                      return <div key={`${wi}-${ci}`} className="min-h-[70px]" />;
                    }
                    const dayTasks = getTasksForDate(cell.dateKey);
                    const isToday = cell.dateKey === todayKey;
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        onClick={() => setSelectedDay(cell.dateKey)}
                        className={`min-h-[70px] rounded-xl border bg-background-soft hover:bg-cream-dark/60 transition-colors p-2 flex flex-col items-start gap-1 text-left ${
                          isToday ? 'border-primary ring-2 ring-primary-light' : 'border-background-dark/40'
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-heading">{cell.day}</span>
                        {dayTasks.slice(0, 2).map((task) => (
                          <span
                            key={task.id}
                            className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white border border-background-dark/60 px-2 py-0.5 text-[10px] text-body"
                          >
                            <span className="text-[8px]">⏰</span>
                            <span className="truncate">{task.title}</span>
                          </span>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[10px] text-muted">+{dayTasks.length - 2} more</span>
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-4 md:p-5">
              <div className="grid grid-cols-7 gap-3 text-xs">
                {weekDays.map((day) => {
                  const dayTasks = getTasksForDate(day.dateKey);
                  const visibleTasks = dayTasks.slice(0, 3);
                  const hiddenCount = Math.max(dayTasks.length - visibleTasks.length, 0);
                  const isToday = day.dateKey === todayKey;
                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() => setSelectedDay(day.dateKey)}
                      className={`rounded-xl border bg-background-soft hover:bg-cream-dark/60 transition-colors p-2 flex flex-col items-start gap-1 text-left min-h-[80px] ${
                        isToday ? 'border-primary ring-2 ring-primary-light' : 'border-background-dark/40'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-heading">
                        {day.weekday} {day.label}
                      </span>
                      {dayTasks.length === 0 && (
                        <span className="text-[10px] text-muted mt-1">No tasks</span>
                      )}
                      {visibleTasks.map((task) => (
                        <span
                          key={task.id}
                          className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white border border-background-dark/60 px-2 py-0.5 text-[10px] text-body"
                        >
                          <span className="text-[8px]">⏰</span>
                          <span className="truncate">{task.title}</span>
                        </span>
                      ))}
                      {hiddenCount > 0 && (
                        <span className="text-[10px] text-muted mt-0.5">+{hiddenCount} more</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </AdminLayout>

      {/* Today's tasks popup on page load */}
      {showTodayTasks && todayTasks.length > 0 && (
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
                      <p className="font-medium text-heading">
                        {task.title}
                        {task.completed ? ' (Completed)' : ''}
                      </p>
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

      {/* Modal: all tasks for selected day */}
      {selectedDay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="Close day tasks"
          />

          <div className="relative z-50 max-w-md w-full rounded-2xl bg-white border border-background-dark shadow-lg p-6">
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
              aria-label="Close day tasks"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-heading mb-3">
              Tasks for {formatHumanDate(selectedDay)}
            </h2>
            <div className="space-y-2 text-sm">
              {tasksForSelectedDay.length === 0 && (
                <p className="text-xs text-muted">No tasks for this day.</p>
              )}
              {tasksForSelectedDay.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-background-dark/60 px-3 py-2 bg-background-soft"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <div>
                      <p className="font-medium text-heading">
                        {task.title}
                        {task.completed ? ' (Completed)' : ''}
                      </p>
                      <p className="text-xs text-text-secondary">{task.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
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
