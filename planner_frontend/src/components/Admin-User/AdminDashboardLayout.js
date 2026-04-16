import React from 'react';
import AdminLayout from './AdminLayout';
import { parseApiResponse, extractApiErrorMessage } from '../../utils/safeApiResponse';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const AdminDashboardLayout = ({ onNavigate, onLogout }) => {
  const storedUser = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const fullName = React.useMemo(() => {
    const first = storedUser?.first_name || storedUser?.firstName || '';
    const last = storedUser?.last_name || storedUser?.lastName || '';
    const combined = `${first} ${last}`.trim();
    return combined || storedUser?.email || 'User';
  }, [storedUser]);

  const [todayTasks, setTodayTasks] = React.useState([]);
  const [tasksLoading, setTasksLoading] = React.useState(false);
  const [tasksError, setTasksError] = React.useState('');
  const [smartSuggestions, setSmartSuggestions] = React.useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
  const [suggestionsError, setSuggestionsError] = React.useState('');

  const formatDateKeyLocal = React.useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const formatTimeTo12 = React.useCallback((value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    const m24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (!m24) return trimmed;
    const hh = Number(m24[1]);
    const mm = m24[2];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
  }, []);

  const priorityBadge = React.useCallback((priority) => {
    if (priority === 'high') {
      return {
        dot: '🔴',
        classes:
          'inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600',
      };
    }
    if (priority === 'low') {
      return {
        dot: '🟢',
        classes:
          'inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700',
      };
    }
    return {
      dot: '🟡',
      classes:
        'inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-yellow-700',
    };
  }, []);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTodayTasks([]);
      setTasksError('You must be logged in to view today tasks.');
      return;
    }

    const controller = new AbortController();
    const fetchTodayTasks = async () => {
      setTasksLoading(true);
      setTasksError('');
      try {
        const today = new Date();
        const todayKey = formatDateKeyLocal(today);
        let url = `${API_BASE_URL}/tasks/`;
        const allTasks = [];

        while (url) {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          });

          const { data } = await parseApiResponse(response);
          if (!response.ok) {
            throw new Error(extractApiErrorMessage(response, data, 'Failed to load tasks.'));
          }

          const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
          allTasks.push(...results);
          url = typeof data?.next === 'string' && data.next ? data.next : null;
        }

        const todayOnly = allTasks
          .filter((task) => task.task_date === todayKey)
          .sort((a, b) => {
            const aTime = `${a.start_time || ''}`;
            const bTime = `${b.start_time || ''}`;
            return aTime.localeCompare(bTime);
          });

        setTodayTasks(todayOnly);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Dashboard today task fetch error', err);
        setTodayTasks([]);
        setTasksError(err.message || 'Something went wrong while loading today tasks.');
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTodayTasks();
    return () => controller.abort();
  }, [formatDateKeyLocal]);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setSmartSuggestions([]);
      setSuggestionsError('You must be logged in to view smart suggestions.');
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      setSuggestionsError('');
      try {
        const response = await fetch(`${API_BASE_URL}/ml/recommendations/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        const { data } = await parseApiResponse(response);
        if (!response.ok) {
          throw new Error(extractApiErrorMessage(response, data, 'Failed to load smart suggestions.'));
        }

        const recommendations = data?.recommendations;
        if (!recommendations) {
          setSmartSuggestions([]);
          return;
        }

        const nextSuggestions = [];

        const recurring = recommendations?.recurring_tasks?.tasks || [];
        if (recurring.length > 0) {
          const topRecurring = recurring[0];
          nextSuggestions.push({
            icon: '✨',
            title: `Consider making "${topRecurring.title}" recurring.`,
            subtitle: `Detected ${topRecurring.count} similar task(s), about ${topRecurring.frequency}/week.`,
          });
        }

        const bestTimeEntries = Object.entries(recommendations?.best_time_predictions?.predictions || {});
        if (bestTimeEntries.length > 0) {
          const [category, bestTime] = bestTimeEntries[0];
          nextSuggestions.push({
            icon: '🧠',
            title: `Best time for ${category}: ${bestTime.time_range}.`,
            subtitle: `Confidence: ${bestTime.confidence}% based on your completion history.`,
          });
        }

        const suggestedOrder = recommendations?.suggested_task_order?.tasks || [];
        if (suggestedOrder.length > 0) {
          const topTask = suggestedOrder[0];
          const topReason = Array.isArray(topTask.reasons) && topTask.reasons.length > 0 ? topTask.reasons[0] : 'priority';
          nextSuggestions.push({
            icon: '⚡',
            title: `Do "${topTask.title}" next.`,
            subtitle: `Reason: ${topReason}.`,
          });
        }

        const insights = recommendations?.insights?.data;
        if (nextSuggestions.length === 0 && insights) {
          nextSuggestions.push({
            icon: '📊',
            title: `Your completion rate is ${insights.completion_rate}%`,
            subtitle: `Completed ${insights.completed_tasks} of ${insights.total_tasks} total tasks.`,
          });
        }

        setSmartSuggestions(nextSuggestions.slice(0, 3));
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Dashboard smart suggestion fetch error', err);
        setSmartSuggestions([]);
        setSuggestionsError(err.message || 'Something went wrong while loading smart suggestions.');
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, []);

  const completedCount = todayTasks.filter((task) => !!task.completed).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  return (
    <AdminLayout currentSection="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Dashboard Home Content */}
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading flex items-center gap-2">
            <span>Good Morning, {fullName}</span>
            <span className="text-xl">👋</span>
          </h1>
        </div>

        {/* Today's Progress Bar */}
        <div className="mb-8 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-heading">Today's Progress</h2>
            <span className="text-xs font-medium text-body">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-background-dark/60 overflow-hidden">
            <div className="h-full rounded-full bg-accent-gold" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Main content: Today's Tasks + Smart Suggestions */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Today's Task List (with priority icons) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-3">Today's Tasks</h2>
            <div className="border-t border-background-dark/60 mb-3" />
            <div className="space-y-3 text-sm text-body">
              {tasksLoading && <p className="text-xs text-body">Loading today's tasks...</p>}
              {!tasksLoading && tasksError && <p className="text-xs text-red-600">{tasksError}</p>}
              {!tasksLoading && !tasksError && todayTasks.length === 0 && (
                <p className="text-xs text-muted">No tasks scheduled for today.</p>
              )}
              {!tasksLoading &&
                !tasksError &&
                todayTasks.map((task) => {
                  const badge = priorityBadge(task.priority);
                  return (
                    <div key={task.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-heading flex items-center gap-2">
                          <span className="text-xs">{badge.dot}</span>
                          <span>
                            {task.title}
                            {task.completed ? ' (Completed)' : ''}
                          </span>
                        </p>
                        <p className="text-xs text-text-secondary">
                          {task.start_time && task.end_time
                            ? `${formatTimeTo12(task.start_time)} – ${formatTimeTo12(task.end_time)}`
                            : task.deadline || '--'}
                        </p>
                      </div>
                      <span className={badge.classes}>
                        <span className="text-[9px]">⬤</span>
                        <span>{task.priority}</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Smart Suggestions Panel (ML based) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-2">Smart Suggestions</h2>
            <p className="text-xs text-muted mb-3">
              ML-based suggestions tailored from your recent study and work patterns.
            </p>
            <div className="space-y-3 text-sm text-body">
              {suggestionsLoading && <p className="text-xs text-body">Loading smart suggestions...</p>}
              {!suggestionsLoading && suggestionsError && <p className="text-xs text-red-600">{suggestionsError}</p>}
              {!suggestionsLoading && !suggestionsError && smartSuggestions.length === 0 && (
                <p className="text-xs text-muted">No suggestions yet. Create and complete more tasks to generate recommendations.</p>
              )}
              {!suggestionsLoading &&
                !suggestionsError &&
                smartSuggestions.map((suggestion, index) => (
                  <div key={`${suggestion.title}-${index}`} className="flex items-start gap-3">
                    <span className="mt-0.5">{suggestion.icon}</span>
                    <p>
                      <span className="font-medium">{suggestion.title}</span>
                      <br />
                      <span className="text-xs text-text-secondary">{suggestion.subtitle}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardLayout;
