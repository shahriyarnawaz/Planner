import React from 'react';
import AdminLayout from './AdminLayout';
import { parseApiResponse, extractApiErrorMessage } from '../../utils/safeApiResponse';
import {
  DEFAULT_REMINDER_MINUTES,
  REMINDER_MINUTE_OPTIONS,
  normalizeReminderMinutes,
} from '../../utils/reminderOptions';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const TemplatesLayout = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = React.useState('templates'); // 'templates' | 'bookmarks'
  const [globalTemplates, setGlobalTemplates] = React.useState([]);
  const [myTemplates, setMyTemplates] = React.useState([]);
  const [templateCategories, setTemplateCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [viewTemplate, setViewTemplate] = React.useState(null);
  const [useTemplate, setUseTemplate] = React.useState(null);
  const [useItems, setUseItems] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [useError, setUseError] = React.useState('');

  const getAccessToken = () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (e) {
      return null;
    }
  };

  const loadTemplateCategories = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/template-categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      const mapped = (results || [])
        .map((c) => ({
          id: c?.id,
          name: c?.name || '',
        }))
        .filter((c) => c.name);

      setTemplateCategories(mapped);
    } catch (e) {
      return;
    }
  };

  const mapGlobalTemplate = (tpl) => {
    return {
      id: tpl?.id,
      name: tpl?.name || 'Untitled',
      description: tpl?.description || '',
      items: Array.isArray(tpl?.items) ? tpl.items : [],
      taskCount: Array.isArray(tpl?.items) ? tpl.items.length : 0,
    };
  };

  const mapMyTemplate = (tpl) => {
    return {
      id: tpl?.id,
      name: tpl?.name || 'Untitled',
      description: tpl?.description || '',
      items: Array.isArray(tpl?.items) ? tpl.items : [],
      taskCount: Array.isArray(tpl?.items) ? tpl.items.length : 0,
    };
  };

  const normalizeTime = (value) => {
    if (!value) return '';
    if (typeof value !== 'string') return '';
    const v = value.trim();
    if (!v) return '';
    if (/^\d{2}:\d{2}$/.test(v)) return v;
    const m = v.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '';
    const hh = String(Number(m[1])).padStart(2, '0');
    const mm = m[2];
    return `${hh}:${mm}`;
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  };

  const parseTimeToMinutes = (value) => {
    if (!value || typeof value !== 'string') return null;
    const m = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  };

  const minutesToTime = (totalMinutes) => {
    const mins = ((totalMinutes % 1440) + 1440) % 1440;
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const ensureMinDuration = (start, end) => {
    const startMin = parseTimeToMinutes(start);
    const endMinRaw = parseTimeToMinutes(end);
    if (startMin == null || endMinRaw == null) return end;

    let endMin = endMinRaw;
    if (endMin <= startMin) {
      endMin += 1440;
    }

    if (endMin - startMin < 15) {
      endMin = startMin + 15;
    }

    return minutesToTime(endMin);
  };

  const inferTemplateItemDurationMinutes = (item) => {
    const explicit = Number(item?.duration);
    if (Number.isFinite(explicit) && explicit >= 15) return Math.round(explicit);

    const start = normalizeTime(item?.start_time);
    const end = normalizeTime(item?.end_time);
    const startMin = parseTimeToMinutes(start);
    const endRaw = parseTimeToMinutes(end);
    if (startMin != null && endRaw != null) {
      let endMin = endRaw;
      if (endMin <= startMin) endMin += 1440;
      return Math.max(15, endMin - startMin);
    }

    return 30;
  };

  const nextFiveMinuteSlot = () => {
    const now = new Date();
    const rounded = new Date(now);
    rounded.setSeconds(0, 0);
    const m = rounded.getMinutes();
    rounded.setMinutes(Math.ceil(m / 5) * 5);
    if (rounded <= now) rounded.setMinutes(rounded.getMinutes() + 5);
    return rounded;
  };

  const cloneItemsForUse = (items) => {
    const list = Array.isArray(items) ? items : [];
    const anchor = nextFiveMinuteSlot();
    let cursor = new Date(anchor);

    return list.map((it, idx) => {
      const duration = inferTemplateItemDurationMinutes(it);
      const startAt = new Date(cursor);
      const endAt = new Date(startAt.getTime() + duration * 60000);
      cursor = new Date(endAt);

      const category = String(it?.category || 'other').trim().toLowerCase();
      const reminder_minutes =
        normalizeReminderMinutes(it?.reminder_minutes) ?? DEFAULT_REMINDER_MINUTES;
      return {
        _key: `${it?.id || 'item'}-${idx}`,
        title: it?.title || '',
        description: it?.description || '',
        priority: it?.priority || 'high',
        category,
        task_date: formatDate(startAt),
        start_time: minutesToTime(startAt.getHours() * 60 + startAt.getMinutes()),
        end_time: minutesToTime(endAt.getHours() * 60 + endAt.getMinutes()),
        reminder_minutes,
      };
    });
  };

  const loadGlobalTemplates = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates/global`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setError(data?.detail || data?.error || 'Failed to load templates.');
        setLoading(false);
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      setGlobalTemplates((results || []).map(mapGlobalTemplate));
      setLoading(false);
    } catch (e) {
      setError('Failed to load templates. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const loadMyTemplates = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setError(data?.detail || data?.error || 'Failed to load your templates.');
        setLoading(false);
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      setMyTemplates((results || []).map(mapMyTemplate));
      setLoading(false);
    } catch (e) {
      setError('Failed to load your templates. Please check your connection and try again.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadGlobalTemplates();
    loadMyTemplates();
    loadTemplateCategories();
  }, []);

  const openViewModal = (tpl) => {
    setViewTemplate(tpl || null);
  };

  const closeViewModal = () => {
    setViewTemplate(null);
  };

  const openUseModal = (tpl) => {
    setUseError('');
    setUseTemplate(tpl || null);
    setUseItems(cloneItemsForUse(tpl?.items));
  };

  const closeUseModal = () => {
    setUseTemplate(null);
    setUseItems([]);
    setUseError('');
    setSubmitting(false);
  };

  const updateUseItem = (idx, patch) => {
    setUseItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const saveGlobalTemplate = async (templateId) => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login again.');
      return;
    }
    if (!templateId) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setError(extractApiErrorMessage(response, data, 'Failed to save template.'));
        setLoading(false);
        return;
      }

      await loadMyTemplates();
      setActiveTab('bookmarks');
      setLoading(false);
    } catch (e) {
      setError('Failed to save template. Please try again.');
      setLoading(false);
    }
  };

  const deleteMyTemplate = async (templateId) => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login again.');
      return;
    }
    if (!templateId) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const { data } = await parseApiResponse(response);
        setError(extractApiErrorMessage(response, data, 'Failed to delete template.'));
        setLoading(false);
        return;
      }

      setMyTemplates((prev) => prev.filter((t) => t.id !== templateId));
      setLoading(false);
    } catch (e) {
      setError('Failed to delete template. Please try again.');
      setLoading(false);
    }
  };

  const createTasksFromUseItems = async () => {
    const token = getAccessToken();
    if (!token) {
      setUseError('Missing access token. Please login again.');
      return;
    }

    setUseError('');

    for (let i = 0; i < useItems.length; i += 1) {
      const it = useItems[i];
      const title = (it?.title || '').trim();
      const task_date = (it?.task_date || '').trim();
      const start_time = (it?.start_time || '').trim();
      const end_time = (it?.end_time || '').trim();
      if (!title) {
        setUseError(`Task ${i + 1}: title is required.`);
        return;
      }
      if (!task_date) {
        setUseError(`Task ${i + 1}: date is required.`);
        return;
      }
      if (!start_time || !end_time) {
        setUseError(`Task ${i + 1}: start time and end time are required.`);
        return;
      }

      try {
        const startDateTime = new Date(`${task_date}T${start_time}`);
        const endDateTime = new Date(`${task_date}T${end_time}`);
        if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
          setUseError(`Task ${i + 1}: invalid date or time.`);
          return;
        }
        let adjustedEnd = new Date(endDateTime.getTime());
        if (adjustedEnd < startDateTime) {
          adjustedEnd = new Date(adjustedEnd.getTime() + 24 * 60 * 60 * 1000);
        }
        const minutes = Math.round((adjustedEnd.getTime() - startDateTime.getTime()) / 60000);
        if (minutes < 15) {
          setUseError(`Task ${i + 1}: duration must be at least 15 minutes.`);
          return;
        }

        const now = new Date();
        const taskDateOnly = new Date(`${task_date}T00:00:00`);
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (taskDateOnly < todayOnly) {
          setUseError(`Task ${i + 1}: date cannot be in the past.`);
          return;
        }
        if (taskDateOnly.getTime() === todayOnly.getTime() && startDateTime <= now) {
          setUseError(`Task ${i + 1}: start time must be in the future for today.`);
          return;
        }
      } catch (e) {
        setUseError(`Task ${i + 1}: invalid date or time selection.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      for (let i = 0; i < useItems.length; i += 1) {
        const it = useItems[i];
        const response = await fetch(`${API_BASE_URL}/tasks/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: (it?.title || '').trim(),
            description: (it?.description || '').trim() || '',
            priority: it?.priority || 'high',
            category: String(it?.category || 'other').trim().toLowerCase(),
            task_date: (it?.task_date || '').trim(),
            start_time: (it?.start_time || '').trim(),
            end_time: (it?.end_time || '').trim(),
            reminder_minutes: normalizeReminderMinutes(it?.reminder_minutes),
          }),
        });

        const { data } = await parseApiResponse(response);
        if (!response.ok) {
          setUseError(extractApiErrorMessage(response, data, `Failed to create task ${i + 1}.`));
          setSubmitting(false);
          return;
        }
      }

      closeUseModal();
      if (onNavigate) onNavigate('tasks');
    } catch (e) {
      setUseError('Failed to create tasks. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout currentSection="templates" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
        <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-heading">Templates</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Use global routines or your own bookmarks to plan days faster.
                </p>
              </div>
            </div>

            {/* Tabs: Templates / Bookmarks */}
            <div className="inline-flex rounded-full border border-background-dark/70 bg-cream-dark/60 p-1 mb-5 text-xs md:text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-olive text-white shadow-sm'
                    : 'text-text-secondary hover:bg-cream-light'
                }`}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'bg-olive text-white shadow-sm'
                    : 'text-text-secondary hover:bg-cream-light'
                }`}
              >
                Bookmarks
              </button>
            </div>

            {/* TEMPLATES TAB: Global templates (read only) */}
            {activeTab === 'templates' && (
              <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted mb-1">
                      All Templates
                    </p>
                    <h2 className="text-sm font-semibold text-heading">
                      Global Templates (Read only)
                    </h2>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="mb-4 text-sm text-text-secondary">Loading...</div>
                )}

                <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
                  {globalTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border border-background-dark bg-background-soft px-3 py-3 flex flex-col gap-2"
                    >
                      <div className="font-semibold text-heading text-sm truncate">
                        {tpl.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <span className="text-xs">⏱</span>
                        <span>{tpl.taskCount} Tasks</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => openViewModal(tpl)}
                          className="px-3 py-1 rounded-full border border-background-dark/70 text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                          disabled={loading}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openUseModal(tpl)}
                          className="px-3 py-1 rounded-full bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-colors"
                          disabled={loading}
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          onClick={() => saveGlobalTemplate(tpl.id)}
                          className="px-3 py-1 rounded-full border border-accent-gold text-[11px] text-accent-gold hover:bg-accent-gold hover:text-white transition-colors"
                          disabled={loading}
                        >
                          Bookmark
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOOKMARKS TAB: User templates */}
            {activeTab === 'bookmarks' && (
              <div className="rounded-2xl bg-white border border-background-dark shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted mb-1">
                      Bookmarked Templates
                    </p>
                    <h2 className="text-sm font-semibold text-heading">My Templates</h2>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm">
                  {myTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border border-background-dark bg-background-soft px-3 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-heading text-sm truncate">
                          {tpl.name}
                        </div>
                        <span className="text-accent-gold text-xs">★</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <span className="text-xs">⏱</span>
                        <span>{tpl.taskCount} Tasks</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => openViewModal(tpl)}
                          className="px-3 py-1 rounded-full border border-background-dark/70 text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                          disabled={loading}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openUseModal(tpl)}
                          className="px-3 py-1 rounded-full bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-colors"
                          disabled={loading}
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full border border-olive text-olive hover:bg-olive hover:text-white transition-colors"
                          disabled
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMyTemplate(tpl.id)}
                          className="px-3 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </section>

      {viewTemplate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closeViewModal}
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="Close template preview"
          />

          <div className="relative z-50 max-w-2xl w-full rounded-2xl bg-white border border-background-dark shadow-lg">
            <div className="p-5 border-b border-background-dark/60">
              <button
                type="button"
                onClick={closeViewModal}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                aria-label="Close template preview"
              >
                ×
              </button>
              <h2 className="text-lg font-bold text-heading">{viewTemplate?.name || 'Template'}</h2>
              {viewTemplate?.description ? (
                <p className="mt-1 text-sm text-text-secondary">{viewTemplate.description}</p>
              ) : null}
            </div>

            <div className="p-5 max-h-[70vh] overflow-auto">
              {(Array.isArray(viewTemplate?.items) ? viewTemplate.items : []).length === 0 ? (
                <div className="text-sm text-text-secondary">No tasks in this template.</div>
              ) : (
                <div className="space-y-3">
                  {viewTemplate.items.map((it, idx) => (
                    <div key={it?.id || idx} className="rounded-xl border border-background-dark bg-background-soft p-4">
                      <div className="font-semibold text-heading text-sm">{it?.title || `Task ${idx + 1}`}</div>
                      <div className="mt-1 text-[11px] text-text-secondary">
                        {it?.task_date ? `${it.task_date} • ` : ''}
                        {(it?.start_time && it?.end_time) ? `${normalizeTime(it.start_time)} - ${normalizeTime(it.end_time)}` : 'Time not set'}
                        {' • '}
                        {it?.category || 'other'}
                        {' • '}
                        {it?.priority || 'medium'}
                      </div>
                      {it?.description ? (
                        <div className="mt-2 text-xs text-body">{it.description}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const tpl = viewTemplate;
                  closeViewModal();
                  openUseModal(tpl);
                }}
                className="rounded-xl bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {useTemplate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closeUseModal}
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="Close use template"
          />

          <div className="relative z-50 max-w-4xl w-full rounded-2xl bg-white border border-background-dark shadow-lg">
            <div className="p-5 border-b border-background-dark/60">
              <button
                type="button"
                onClick={closeUseModal}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                aria-label="Close use template"
                disabled={submitting}
              >
                ×
              </button>
              <h2 className="text-lg font-bold text-heading">Use Template: {useTemplate?.name || 'Template'}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                This template is converted into active tasks using your current date/time. It then enters Task Management
                queue exactly like tasks you create manually.
              </p>
            </div>

            <div className="p-5 max-h-[70vh] overflow-auto">
              {useError && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {useError}
                </div>
              )}

              {useItems.length === 0 ? (
                <div className="text-sm text-text-secondary">No tasks in this template.</div>
              ) : (
                <div className="space-y-4">
                  {useItems.map((it, idx) => (
                    <div key={it._key} className="rounded-2xl border border-background-dark bg-background-soft p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-heading">Task {idx + 1}</div>
                      </div>

                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-heading mb-1">Title</label>
                          <input
                            value={it.title}
                            onChange={(e) => updateUseItem(idx, { title: e.target.value })}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            disabled={submitting}
                          />
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="block text-xs font-semibold text-heading mb-1">Date</label>
                            <input
                              type="date"
                              value={it.task_date}
                              onChange={(e) => updateUseItem(idx, { task_date: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-heading mb-1">Start time</label>
                            <input
                              type="time"
                              value={it.start_time}
                              onChange={(e) => {
                                const nextStart = e.target.value;
                                const nextEnd = ensureMinDuration(nextStart, it.end_time);
                                updateUseItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-heading mb-1">End time</label>
                            <input
                              type="time"
                              value={it.end_time}
                              onChange={(e) => {
                                const nextEnd = e.target.value;
                                const nextStart = ensureMinDuration(it.start_time, nextEnd);
                                updateUseItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                              disabled={submitting}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-heading mb-1">Category</label>
                            <select
                              value={String(it.category || 'other').toLowerCase()}
                              onChange={(e) => updateUseItem(idx, { category: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                              disabled={submitting}
                            >
                              {templateCategories.length > 0 ? (
                                templateCategories.map((c) => {
                                  const v = String(c.name || '').trim().toLowerCase();
                                  return (
                                    <option key={c.id} value={v}>
                                      {v ? v.charAt(0).toUpperCase() + v.slice(1) : c.name}
                                    </option>
                                  );
                                })
                              ) : (
                                <>
                                  <option value="study">Study</option>
                                  <option value="work">Work</option>
                                  <option value="health">Health</option>
                                  <option value="personal">Personal</option>
                                  <option value="shopping">Shopping</option>
                                  <option value="other">Other</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-heading mb-1">Priority</label>
                            <select
                              value={it.priority || 'high'}
                              onChange={(e) => updateUseItem(idx, { priority: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                              disabled={submitting}
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-heading mb-1">Reminder</label>
                          <select
                            value={
                              it.reminder_minutes === null || it.reminder_minutes === undefined || it.reminder_minutes === ''
                                ? ''
                                : String(it.reminder_minutes)
                            }
                            onChange={(e) =>
                              updateUseItem(idx, {
                                reminder_minutes: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-full max-w-md rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            disabled={submitting}
                          >
                            {REMINDER_MINUTE_OPTIONS.map((opt) => (
                              <option key={opt.value === '' ? 'default' : opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            {it.reminder_minutes !== null &&
                              it.reminder_minutes !== undefined &&
                              it.reminder_minutes !== '' &&
                              !REMINDER_MINUTE_OPTIONS.some((o) => o.value === String(it.reminder_minutes)) && (
                                <option value={String(it.reminder_minutes)}>
                                  {it.reminder_minutes} min before (from template)
                                </option>
                              )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-heading mb-1">Description (optional)</label>
                          <textarea
                            value={it.description}
                            onChange={(e) => updateUseItem(idx, { description: e.target.value })}
                            rows={2}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeUseModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTasksFromUseItems}
                className="rounded-xl bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TemplatesLayout;
