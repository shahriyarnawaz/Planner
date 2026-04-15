import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';

const statusClass = (status) => {
  if (status === 'healthy') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (status === 'degraded') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-gray-50 border-gray-200 text-gray-700';
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const SystemAdminMLLayout = ({ onNavigate, onLogout }) => {
  const [models, setModels] = React.useState([]);
  const [outcomes, setOutcomes] = React.useState([]);
  const [errors, setErrors] = React.useState([]);
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxSuggestions, setMaxSuggestions] = React.useState(5);
  const [loading, setLoading] = React.useState(true);
  const [actionMessage, setActionMessage] = React.useState('');

  const fetchStatus = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/ml/admin/status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
        setOutcomes(data.recent_outcomes || []);
        setErrors(data.recent_errors || []);
        if (data.tuning) {
          setTemperature(data.tuning.temperature);
          setMaxSuggestions(data.tuning.max_suggestions);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleApplyTuning = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/ml/admin/config/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ temperature, max_suggestions: maxSuggestions })
      });
      if (res.ok) {
        setActionMessage('Tuning applied successfully!');
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (actionType) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/ml/admin/action/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: actionType })
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message || 'Action executed successfully');
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <SystemAdminLayout currentSection="sys_ml" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-heading">Monitor & Tune ML Models</h1>
            <p className="text-sm text-text-secondary mt-1">
              Inspect outcomes, review errors, and adjust parameters.
            </p>
          </div>
          {actionMessage && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm border border-emerald-200 font-medium">
              {actionMessage}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-sm text-text-secondary animate-pulse py-10">Loading ML telemetry...</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {models.map((m) => (
                <div key={m.id} className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-heading">{m.name}</div>
                  <div className="text-xs text-text-secondary mt-1">Version: {m.version}</div>
                  <div className="text-xs text-text-muted mt-1">Last trained: {m.last_trained ? new Date(m.last_trained).toLocaleString() : 'N/A'}</div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(m.status)}`}>
                  {m.status}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
                >
                  Retrain
                </button>
                <button
                  type="button"
                  className="rounded-full border border-background-dark bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <h2 className="text-sm font-semibold text-heading">Recent Model Outcomes</h2>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {outcomes.length === 0 ? <p className="text-xs text-text-muted">No recent inferences logged.</p> : outcomes.map((o) => (
                <div key={o.id} className="rounded-xl border border-background-dark bg-background-soft p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{o.model}</div>
                    <div className="text-xs text-text-muted">Confidence: {(o.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div className="mt-2 text-sm text-heading font-medium">Input</div>
                  <div className="text-sm text-text-secondary truncate">{o.input_data}</div>
                  <div className="mt-2 text-sm text-heading font-medium">Output</div>
                  <div className="text-sm text-text-secondary w-full overflow-hidden text-ellipsis line-clamp-2">{o.output_data}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <h2 className="text-sm font-semibold text-heading">Tuning Controls</h2>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />

            <div className="space-y-4">
              <div className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">Temperature</div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs font-semibold text-text-secondary w-12 text-right">{temperature.toFixed(2)}</div>
                </div>
              </div>

              <div className="rounded-xl bg-background-soft border border-background-dark/60 p-4">
                <div className="text-xs text-text-muted">Max Suggestions</div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxSuggestions}
                    onChange={(e) => setMaxSuggestions(parseInt(e.target.value || '1', 10))}
                    className="w-24 rounded-lg border border-background-dark bg-white px-3 py-2 text-sm text-body"
                  />
                  <button
                    type="button"
                    onClick={handleApplyTuning}
                    className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-2 text-xs text-text-secondary">Applies to ML-based suggestions shown to users.</div>
              </div>

              <div className="rounded-xl border border-background-dark/60 bg-background-soft p-4">
                <div className="text-xs text-text-muted">Quick Actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('clear_cache')}
                    className="rounded-full border border-background-dark bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    Clear cache
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('run_evaluation')}
                    className="rounded-full border border-background-dark bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    Run evaluation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-background-dark p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-heading">Recent Errors</h2>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('sys_logs')}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View logs
            </button>
          </div>
          <div className="border-t border-background-dark/60 mt-3 mb-4" />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="py-2 pr-4">Time (PK)</th>
                  <th className="py-2 pr-4">Model</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-dark/60">
                {errors.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-xs text-text-muted italic">No anomalies detected.</td>
                  </tr>
                ) : errors.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 pr-4 text-xs text-text-secondary">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{e.model}</span>
                    </td>
                    <td className="py-3 text-sm text-text-secondary">{e.error_message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </section>
    </SystemAdminLayout>
  );
};

export default SystemAdminMLLayout;
