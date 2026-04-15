import React from 'react';
import AdminLayout from './AdminLayout';

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

  const todayStr = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        // Fetch Today's Tasks
        const tasksRes = await fetch(`${API_BASE_URL}/tasks/?date=${todayStr}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.tasks || []);
        }

        // Fetch ML Suggestions
        const mlRes = await fetch(`${API_BASE_URL}/ml/recommendations/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          setSuggestions(mlData.recommendations || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL, todayStr]);

  const progress = React.useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

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
            <span className="text-xs font-medium text-body">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-background-dark/60 overflow-hidden">
            <div className={`h-full rounded-full bg-accent-gold transition-all duration-500`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Main content: Today's Tasks + Smart Suggestions */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Today's Task List (with priority icons) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-3">Today's Tasks</h2>
            <div className="border-t border-background-dark/60 mb-3" />
            <div className="space-y-4 text-sm text-body">
              {loading ? (
                <p className="text-xs text-muted animate-pulse">Loading today's tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No tasks scheduled for today.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between group">
                    <div>
                      <p className={`font-medium text-heading flex items-center gap-2 ${task.completed ? 'opacity-50 line-through' : ''}`}>
                        <span className="text-[10px]">
                          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span>{task.title}</span>
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {task.start_time?.substring(0, 5)} – {task.end_time?.substring(0, 5)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                      task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Smart Suggestions Panel (ML based) */}
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <h2 className="text-sm font-semibold text-heading mb-2">Smart Suggestions</h2>
            <p className="text-xs text-muted mb-3">
              ML-based suggestions tailored from your recent study and work patterns.
            </p>
            <div className="space-y-4 text-sm text-body">
              {loading ? (
                <p className="text-xs text-muted animate-pulse">Analyzing your patterns...</p>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl opacity-20 block mb-2">✨</span>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Personalized suggestions will appear here once we've analyzed more of your activity.
                  </p>
                </div>
              ) : (
                suggestions.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <span className="mt-0.5 text-base grayscale group-hover:grayscale-0 transition-all">
                      {rec.type === 'recurring' ? '✨' : rec.type === 'optimization' ? '⚡' : '🧠'}
                    </span>
                    <p className="leading-snug">
                      <span className="font-bold text-heading text-[12px]">{rec.title}</span>
                      <br />
                      <span className="text-[10px] text-text-secondary">{rec.reason}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboardLayout;
