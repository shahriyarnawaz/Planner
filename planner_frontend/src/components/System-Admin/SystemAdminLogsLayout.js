import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';


const levelClass = (level) => {
  if (level === 'ERROR') return 'bg-red-50 border-red-200 text-red-700';
  if (level === 'WARN') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-emerald-50 border-emerald-200 text-emerald-700';
};


const SystemAdminLogsLayout = ({ onNavigate, onLogout }) => {
  const [logs, setLogs] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [level, setLevel] = React.useState('ALL');
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (level !== 'ALL') params.append('level', level);
      if (query.trim()) params.append('search', query.trim());

      const res = await fetch(`${API_BASE_URL}/admin/logs/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.results || data); // Handle both paginated and non-paginated
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [level, query]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
        fetchLogs();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchLogs]);


  return (
    <SystemAdminLayout currentSection="sys_logs" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">System Logs & Audit</h1>
          <p className="text-sm text-text-secondary mt-1">
            View logs for user activity and system events to diagnose issues and ensure security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search logs by event, actor, message"
                  className="w-full rounded-full border border-background-dark bg-background-soft px-4 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="rounded-full border border-background-dark bg-background-soft px-4 py-2 text-sm text-body focus:outline-none"
                >
                  <option value="ALL">All levels</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <div className="text-xs text-text-muted">
                  {logs.length} records
                </div>
              </div>
            </div>

            <div className="border-t border-background-dark/60 my-4" />

            {loading ? (
              <div className="animate-pulse py-10 text-sm text-text-secondary">Fetching system logs...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-text-muted">
                      <th className="py-2 pr-4">Time (PK)</th>
                      <th className="py-2 pr-4">Level</th>
                      <th className="py-2 pr-4">Event</th>
                      <th className="py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-dark/60">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-xs text-text-muted italic">No logs found matching criteria.</td>
                      </tr>
                    ) : logs.map((l) => (
                      <tr
                        key={l.id}
                        className="cursor-pointer hover:bg-background-soft"
                        onClick={() => setSelected(l)}
                      >
                        <td className="py-3 pr-4 text-xs text-text-secondary">{new Date(l.at).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${levelClass(l.level)}`}>
                            {l.level}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{l.event}</span>
                        </td>
                        <td className="py-3 text-sm text-text-secondary truncate max-w-[300px]">{l.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <h2 className="text-sm font-semibold text-heading">Audit Detail</h2>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />

            {!selected ? (
              <div className="text-sm text-text-secondary">Select a log record to view details.</div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-text-muted">ID</div>
                  <div className="font-medium text-heading">{selected.id}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Time (PK)</div>
                  <div className="font-medium text-heading">{selected.at}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Level</div>
                  <div className="font-medium text-heading">{selected.level}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Actor</div>
                  <div className="font-medium text-heading">{selected.actor}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Event</div>
                  <div className="font-medium text-heading">{selected.event}</div>
                </div>
                 <div>
                  <div className="text-xs text-text-muted">Message</div>
                  <div className="text-text-secondary break-words">{selected.message}</div>
                </div>
                {selected.ip_address && (
                  <div>
                    <div className="text-xs text-text-muted">IP Address</div>
                    <div className="font-medium text-heading">{selected.ip_address}</div>
                  </div>
                )}
                {selected.path && (
                  <div>
                    <div className="text-xs text-text-muted">API Path</div>
                    <div className="font-medium text-heading truncate">{selected.path}</div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-background-dark bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </SystemAdminLayout>
  );
};

export default SystemAdminLogsLayout;
