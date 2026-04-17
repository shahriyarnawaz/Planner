import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';
import { parseApiResponse, extractApiErrorMessage } from '../../utils/safeApiResponse';
import {
  DEFAULT_REMINDER_MINUTES,
  REMINDER_MINUTE_OPTIONS,
  normalizeReminderMinutes,
} from '../../utils/reminderOptions';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

/** Must match Task.CATEGORY_CHOICES / TemplateCategory API validation */
const TASK_CATEGORY_SLUGS = ['study', 'work', 'health', 'personal', 'shopping', 'other'];

const SystemAdminTemplatesLayout = ({ onNavigate, onLogout }) => {

  const [templates, setTemplates] = React.useState([]);
  const [categories, setCategories] = React.useState([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [viewTemplate, setViewTemplate] = React.useState(null);

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editTemplateId, setEditTemplateId] = React.useState(null);
  const [editTemplateName, setEditTemplateName] = React.useState('');
  const [editTemplateDescription, setEditTemplateDescription] = React.useState('');
  const [editTemplateItems, setEditTemplateItems] = React.useState([]);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [newTemplateDescription, setNewTemplateDescription] = React.useState('');
  const [newTemplateItems, setNewTemplateItems] = React.useState([]);

  const [createCategoryModalOpen, setCreateCategoryModalOpen] = React.useState(false);
  const [createCategoryName, setCreateCategoryName] = React.useState('');
  const [createCategoryError, setCreateCategoryError] = React.useState('');

  const [editCategoryModalOpen, setEditCategoryModalOpen] = React.useState(false);
  const [editCategoryId, setEditCategoryId] = React.useState(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [editCategoryError, setEditCategoryError] = React.useState('');

  const getAccessToken = () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (e) {
      return null;
    }
  };

  const parseTimeToMinutes = (value) => {
    if (!value || typeof value !== 'string') return null;
    const m = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
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

  const toTimeInputValue = (value) => {
    if (!value) return '';
    const s = String(value).trim();
    const m = s.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?/);
    if (!m) return '';
    return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
  };

  const defaultCategoryForNewItem = () => {
    const first = (categories || []).find((c) => TASK_CATEGORY_SLUGS.includes(String(c?.name || '').trim().toLowerCase()));
    return first ? String(first.name).trim().toLowerCase() : 'other';
  };

  const mapTemplate = (tpl) => {
    return {
      id: tpl?.id,
      title: tpl?.name || 'Untitled',
      description: tpl?.description || '',
      items: Array.isArray(tpl?.items) ? tpl.items : [],
      createdAt: tpl?.created_at,
      updatedAt: tpl?.updated_at,
    };
  };

  const loadTemplates = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
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
        setError(extractApiErrorMessage(response, data, 'Failed to load templates.'));
        setLoading(false);
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      setTemplates((results || []).map(mapTemplate));
      setLoading(false);
    } catch (e) {
      setError('Failed to load templates. Please check your connection and try again.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTemplates();
  }, []);

  const mapCategory = (c) => {
    return {
      id: c?.id,
      name: c?.name || '',
    };
  };

  const loadCategories = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setError('');
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
        setError(extractApiErrorMessage(response, data, 'Failed to load categories.'));
        setLoading(false);
        return;
      }

      const results = Array.isArray(data) ? data : data?.results;
      setCategories((results || []).map(mapCategory));
      setLoading(false);
    } catch (e) {
      setError('Failed to load categories. Please check your connection and try again.');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  const categoryOptionsForItems = React.useMemo(() => {
    const list = (categories || []).filter((c) =>
      TASK_CATEGORY_SLUGS.includes(String(c?.name || '').trim().toLowerCase()),
    );
    if (list.length > 0) {
      return list.map((c) => {
        const v = String(c.name).trim().toLowerCase();
        return { value: v, label: v.charAt(0).toUpperCase() + v.slice(1) };
      });
    }
    return TASK_CATEGORY_SLUGS.map((slug) => ({
      value: slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
    }));
  }, [categories]);

  const openCreateCategoryModal = () => {
    setCreateCategoryName('');
    setCreateCategoryError('');
    setCreateCategoryModalOpen(true);
  };

  const closeCreateCategoryModal = () => {
    setCreateCategoryModalOpen(false);
    setCreateCategoryName('');
    setCreateCategoryError('');
  };

  const openCreateModal = () => {
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateItems([]);
    setError('');
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateItems([]);
  };

  const updateNewItem = (index, patch) => {
    setNewTemplateItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const getCurrentDateAndTimeSlot = () => {
    const now = new Date();
    const rounded = new Date(now);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(Math.ceil(rounded.getMinutes() / 5) * 5);
    if (rounded <= now) rounded.setMinutes(rounded.getMinutes() + 5);

    const toDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const start = minutesToTime(rounded.getHours() * 60 + rounded.getMinutes());
    const end = minutesToTime(rounded.getHours() * 60 + rounded.getMinutes() + 30);

    return {
      task_date: toDate(rounded),
      start_time: start,
      end_time: end,
    };
  };

  const addNewItem = () => {
    const nowSlot = getCurrentDateAndTimeSlot();
    setNewTemplateItems((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        priority: 'high',
        category: defaultCategoryForNewItem(),
        task_date: nowSlot.task_date,
        start_time: nowSlot.start_time,
        end_time: nowSlot.end_time,
        duration: null,
        reminder_minutes: DEFAULT_REMINDER_MINUTES,
        order: prev.length,
      },
    ]);
  };

  const removeNewItem = (index) => {
    setNewTemplateItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((it, idx) => ({
          ...it,
          order: idx,
        }))
    );
  };

  const validateTemplateItems = (items) => {
    if (items.some((it) => !it.title)) {
      return 'All template items must have a title.';
    }

    const invalidCategory = items.find(
      (it) => it.category && !TASK_CATEGORY_SLUGS.includes(String(it.category).trim().toLowerCase()),
    );
    if (invalidCategory) {
      return `Category "${invalidCategory.category}" is not supported. Allowed: ${TASK_CATEGORY_SLUGS.join(', ')}.`;
    }

    const badReminder = items.find((it) => {
      if (it.reminder_minutes === null || it.reminder_minutes === undefined || it.reminder_minutes === '') return false;
      const n = Number(it.reminder_minutes);
      return !Number.isFinite(n) || n < 0 || n > 1440;
    });
    if (badReminder) {
      return 'Reminder must be between 0 and 1440 minutes, or use Account default.';
    }

    for (let i = 0; i < items.length; i += 1) {
      const it = items[i];
      if (it.task_date && it.start_time && it.end_time) {
        const startMin = parseTimeToMinutes(it.start_time);
        const endMin = parseTimeToMinutes(it.end_time);
        if (startMin != null && endMin != null) {
          let end = endMin;
          if (end <= startMin) end += 1440;
          if (end - startMin < 15) {
            return `Template item ${i + 1}: duration must be at least 15 minutes.`;
          }
        }
      }
    }

    return '';
  };

  const openViewModal = (template) => {
    setViewTemplate(template || null);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewTemplate(null);
  };

  const openEditModal = (template) => {
    setError('');
    setEditTemplateId(template?.id || null);
    setEditTemplateName(template?.title || '');
    setEditTemplateDescription(template?.description || '');
    setEditTemplateItems(
      Array.isArray(template?.items)
        ? template.items.map((i) => {
            const rawCat = String(i?.category || 'other').trim().toLowerCase();
            const category = TASK_CATEGORY_SLUGS.includes(rawCat) ? rawCat : 'other';
            return {
              id: i?.id,
              title: i?.title || '',
              description: i?.description || '',
              priority: i?.priority || 'high',
              category,
              task_date: i?.task_date || null,
              start_time: i?.start_time ? toTimeInputValue(i.start_time) : '',
              end_time: i?.end_time ? toTimeInputValue(i.end_time) : '',
              duration: i?.duration ?? null,
              reminder_minutes:
                i?.reminder_minutes !== null && i?.reminder_minutes !== undefined && i?.reminder_minutes !== ''
                  ? Number(i.reminder_minutes)
                  : DEFAULT_REMINDER_MINUTES,
              order: typeof i?.order === 'number' ? i.order : 0,
            };
          })
        : []
    );
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditTemplateId(null);
    setEditTemplateName('');
    setEditTemplateDescription('');
    setEditTemplateItems([]);
  };

  const updateEditItem = (index, patch) => {
    setEditTemplateItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const addEditItem = () => {
    const nowSlot = getCurrentDateAndTimeSlot();
    setEditTemplateItems((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        priority: 'high',
        category: defaultCategoryForNewItem(),
        task_date: nowSlot.task_date,
        start_time: nowSlot.start_time,
        end_time: nowSlot.end_time,
        duration: null,
        reminder_minutes: DEFAULT_REMINDER_MINUTES,
        order: prev.length,
      },
    ]);
  };

  const removeEditItem = (index) => {
    setEditTemplateItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((it, idx) => ({
          ...it,
          order: idx,
        }))
    );
  };

  const deleteTemplate = async (templateId) => {
    if (!templateId) return;
    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

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

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      setLoading(false);
    } catch (e) {
      setError('Failed to delete template. Please try again.');
      setLoading(false);
    }
  };

  const saveTemplateEdit = async () => {
    const id = editTemplateId;
    const name = (editTemplateName || '').trim();
    const description = (editTemplateDescription || '').trim();
    if (!id) return;
    if (!name) {
      setError('Template name is required.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    const items = (editTemplateItems || []).map((it, idx) => ({
      title: (it?.title || '').trim(),
      description: (it?.description || '').trim() || null,
      priority: it?.priority || 'high',
      category: String(it?.category || 'other').trim().toLowerCase(),
      task_date: it?.task_date || null,
      start_time: it?.start_time ? String(it.start_time).trim() || null : null,
      end_time: it?.end_time ? String(it.end_time).trim() || null : null,
      duration: it?.duration ?? null,
      reminder_minutes: normalizeReminderMinutes(it?.reminder_minutes),
      order: typeof it?.order === 'number' ? it.order : idx,
    }));

    const patchValidationError = validateTemplateItems(items);
    if (patchValidationError) {
      setError(patchValidationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          items,
        }),
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setError(extractApiErrorMessage(response, data, 'Failed to update template.'));
        setLoading(false);
        return;
      }

      const updated = mapTemplate(data);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setLoading(false);
      closeEditModal();
    } catch (e) {
      setError('Failed to update template. Please try again.');
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    const name = (newTemplateName || '').trim();
    const description = (newTemplateDescription || '').trim();
    if (!name) {
      setError('Template name is required.');
      return;
    }

    const items = (newTemplateItems || []).map((it, idx) => ({
      title: (it?.title || '').trim(),
      description: (it?.description || '').trim() || null,
      priority: it?.priority || 'high',
      category: String(it?.category || 'other').trim().toLowerCase(),
      task_date: it?.task_date || null,
      start_time: it?.start_time ? String(it.start_time).trim() || null : null,
      end_time: it?.end_time ? String(it.end_time).trim() || null : null,
      duration: it?.duration ?? null,
      reminder_minutes: normalizeReminderMinutes(it?.reminder_minutes),
      order: typeof it?.order === 'number' ? it.order : idx,
    }));

    const createValidationError = validateTemplateItems(items);
    if (createValidationError) {
      setError(createValidationError);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          items,
        }),
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setError(extractApiErrorMessage(response, data, 'Failed to create template.'));
        setLoading(false);
        return;
      }

      setTemplates((prev) => [mapTemplate(data), ...prev]);
      setLoading(false);
      closeCreateModal();
    } catch (e) {
      setError('Failed to create template. Please try again.');
      setLoading(false);
    }
  };

  const createCategory = async () => {
    const value = (createCategoryName || '').trim().toLowerCase();
    if (!value) {
      setCreateCategoryError('Category name is required.');
      return;
    }

    if (!TASK_CATEGORY_SLUGS.includes(value)) {
      setCreateCategoryError(`Category must be one of: ${TASK_CATEGORY_SLUGS.join(', ')}.`);
      return;
    }

    if (categories.some((c) => (c?.name || '').toLowerCase() === value)) {
      setCreateCategoryError('Category already exists.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setCreateCategoryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/template-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: value }),
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setCreateCategoryError(extractApiErrorMessage(response, data, 'Failed to create category.'));
        setLoading(false);
        return;
      }

      setCategories((prev) => [...prev, mapCategory(data)].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setLoading(false);
      closeCreateCategoryModal();
    } catch (e) {
      setError('Failed to create category. Please try again.');
      setLoading(false);
    }
  };

  const openEditCategoryModal = (category) => {
    setEditCategoryId(category?.id || null);
    setEditCategoryName(category?.name || '');
    setEditCategoryError('');
    setEditCategoryModalOpen(true);
  };

  const closeEditCategoryModal = () => {
    setEditCategoryModalOpen(false);
    setEditCategoryId(null);
    setEditCategoryName('');
    setEditCategoryError('');
  };

  const saveCategoryEdit = async () => {
    const id = editCategoryId;
    const name = (editCategoryName || '').trim().toLowerCase();
    if (!id) return;
    if (!name) {
      setEditCategoryError('Category name is required.');
      return;
    }

    if (!TASK_CATEGORY_SLUGS.includes(name)) {
      setEditCategoryError(`Category must be one of: ${TASK_CATEGORY_SLUGS.join(', ')}.`);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setEditCategoryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/template-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        setEditCategoryError(extractApiErrorMessage(response, data, 'Failed to update category.'));
        setLoading(false);
        return;
      }

      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? mapCategory(data) : c))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
      setLoading(false);
      closeEditCategoryModal();
    } catch (e) {
      setError('Failed to update category. Please try again.');
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!id) return;

    const token = getAccessToken();
    if (!token) {
      setError('Missing access token. Please login as Super Admin again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/template-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const { data } = await parseApiResponse(response);
        setError(extractApiErrorMessage(response, data, 'Failed to delete category.'));
        setLoading(false);
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setLoading(false);
    } catch (e) {
      setError('Failed to delete category. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SystemAdminLayout currentSection="sys_templates" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">Template / Content Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Add/edit default templates and categories. Template items use the same fields as tasks (date, times,
            category, priority, description) so users can apply a template and only adjust date and time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">Default Templates</h2>
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
              >
                + Add Template
              </button>
            </div>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />

            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {loading && (
              <div className="mb-4 text-sm text-text-secondary">Loading...</div>
            )}

            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-xl border border-background-dark bg-background-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-heading">{t.title}</div>
                      <div className="text-xs text-text-secondary mt-1">Items: <span className="font-medium">{Array.isArray(t.items) ? t.items.length : 0}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(t)}
                        className="rounded-full border border-background-dark px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(t)}
                        className="rounded-full border border-background-dark px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(t.id)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:text-red-700 transition-colors"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <h2 className="text-sm font-semibold text-heading">Categories</h2>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="rounded-full bg-olive text-white px-4 py-2 text-xs font-semibold hover:bg-olive-dark transition-colors"
              >
                + Add Category
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex item-center  justify-between rounded-full w-[100%] border border-background-dark bg-background-soft px-3 py-1"
                >
                  <div>
                    <span className="text-xs font-semibold text-text-secondary">{c.name}</span>
                  </div>
                  <div className='flex item-center  gap-2'>
                  <button
                    type="button"
                    onClick={() => openEditCategoryModal(c)}
                    className="text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(c.id)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
                    disabled={loading}
                  >
                    Delete
                  </button>
                  </div>

                </div>
              ))}
            </div>

            {/* <div className="mt-6 rounded-xl border border-background-dark/60 bg-background-soft p-4">
              <div className="text-xs text-text-muted">Recommended routines</div>
              <div className="mt-2 text-sm text-text-secondary">
                Add/edit curated routines (e.g., “Pomodoro Study”, “Workout Split”) to appear as suggestions for users.
              </div>
              <button
                type="button"
                className="mt-3 rounded-full border border-background-dark bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                Manage routines
              </button>
            </div> */}
          </div>
        </div>
      </section>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-background-dark">
            <div className="p-5 border-b border-background-dark/60">
              <h2 className="text-lg font-bold text-heading">Create template</h2>
              <p className="mt-1 text-sm text-text-secondary">This template will be available to all users.</p>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-auto">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">Name</label>
                  <input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    placeholder="Template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1">Description (optional)</label>
                  <input
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    placeholder="Write a short description..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-heading">Template items</h3>
                <button
                  type="button"
                  onClick={addNewItem}
                  className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
                  disabled={loading}
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {newTemplateItems.map((it, idx) => (
                  <div key={idx} className="rounded-xl border border-background-dark bg-background-soft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Title</label>
                          <input
                            value={it.title}
                            onChange={(e) => updateNewItem(idx, { title: e.target.value })}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            placeholder="e.g. Study for math exam"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Date (optional)</label>
                            <input
                              type="date"
                              value={it.task_date || ''}
                              onChange={(e) => updateNewItem(idx, { task_date: e.target.value || null })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Start time</label>
                            <input
                              type="time"
                              value={it.start_time || ''}
                              onChange={(e) => {
                                const nextStart = e.target.value || null;
                                const nextEnd = ensureMinDuration(nextStart, it.end_time);
                                updateNewItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">End time</label>
                            <input
                              type="time"
                              value={it.end_time || ''}
                              onChange={(e) => {
                                const nextEnd = e.target.value || null;
                                const nextStart = ensureMinDuration(it.start_time, nextEnd);
                                updateNewItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                            <select
                              value={String(it.category || 'other').toLowerCase()}
                              onChange={(e) => updateNewItem(idx, { category: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            >
                              {categoryOptionsForItems.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Priority</label>
                            <select
                              value={it.priority || 'high'}
                              onChange={(e) => updateNewItem(idx, { priority: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Reminder</label>
                          <select
                            value={
                              it.reminder_minutes === null || it.reminder_minutes === undefined || it.reminder_minutes === ''
                                ? ''
                                : String(it.reminder_minutes)
                            }
                            onChange={(e) =>
                              updateNewItem(idx, {
                                reminder_minutes: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-full max-w-md rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                          >
                            {REMINDER_MINUTE_OPTIONS.map((opt) => (
                              <option key={opt.value === '' ? 'default' : opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Description (optional)</label>
                          <textarea
                            rows={2}
                            value={it.description || ''}
                            onChange={(e) => updateNewItem(idx, { description: e.target.value })}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            placeholder="Description"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewItem(idx)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:text-red-700 transition-colors"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {newTemplateItems.length === 0 && (
                  <div className="text-sm text-text-muted">No items yet. Click “Add Item” to start.</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTemplate}
                className="rounded-xl bg-olive hover:bg-olive-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={loading}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {createCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-background-dark">
            <div className="p-5 border-b border-background-dark/60">
              <h2 className="text-lg font-bold text-heading">Create category</h2>
            </div>

            <div className="p-5 space-y-4">
              {createCategoryError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {createCategoryError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-heading mb-1">Name</label>
                <input
                  value={createCategoryName}
                  onChange={(e) => setCreateCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Category name"
                />
              </div>
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateCategoryModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createCategory}
                className="rounded-xl bg-olive hover:bg-olive-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={loading}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {editCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-background-dark">
            <div className="p-5 border-b border-background-dark/60">
              <h2 className="text-lg font-bold text-heading">Edit category</h2>
            </div>

            <div className="p-5 space-y-4">
              {editCategoryError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {editCategoryError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-heading mb-1">Name</label>
                <input
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  placeholder="Category name"
                />
              </div>
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEditCategoryModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCategoryEdit}
                className="rounded-xl bg-olive hover:bg-olive-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-background-dark">
            <div className="p-5 border-b border-background-dark/60">
              <h2 className="text-lg font-bold text-heading">Template details</h2>
              <div className="mt-1 text-sm text-text-secondary">
                {viewTemplate?.title || 'Untitled'}
              </div>
            </div>

            <div className="p-5">
              {viewTemplate?.description ? (
                <div className="text-sm text-text-secondary mb-4">{viewTemplate.description}</div>
              ) : (
                <div className="text-sm text-text-muted mb-4">No description</div>
              )}

              <div className="space-y-3">
                {(viewTemplate?.items || []).map((it, idx) => (
                  <div key={it?.id || idx} className="rounded-xl border border-background-dark bg-background-soft p-4">
                    <div className="font-semibold text-heading">{it?.title || 'Untitled item'}</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      Category: <span className="font-medium">{it?.category || 'other'}</span>
                      {' · '}
                      Priority: <span className="font-medium">{it?.priority || 'medium'}</span>
                      {' · '}
                      Reminder:{' '}
                      <span className="font-medium">
                        {it?.reminder_minutes !== null && it?.reminder_minutes !== undefined && it?.reminder_minutes !== ''
                          ? `${it.reminder_minutes} min before start`
                          : `${DEFAULT_REMINDER_MINUTES} min before start (same as new task)`}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-text-secondary">
                      Date: <span className="font-medium">{it?.task_date || '—'}</span>
                      {' · '}
                      Start: <span className="font-medium">{it?.start_time || '—'}</span>
                      {' · '}
                      End: <span className="font-medium">{it?.end_time || '—'}</span>
                    </div>
                    {it?.description ? (
                      <div className="mt-2 text-sm text-text-secondary">{it.description}</div>
                    ) : null}
                  </div>
                ))}

                {(!viewTemplate?.items || viewTemplate.items.length === 0) && (
                  <div className="text-sm text-text-muted">No template items yet.</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={loading}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeViewModal();
                  openEditModal(viewTemplate);
                }}
                className="rounded-xl bg-olive hover:bg-olive-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={loading}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-background-dark">
            <div className="p-5 border-b border-background-dark/60">
              <h2 className="text-lg font-bold text-heading">Edit template</h2>
              <p className="mt-1 text-sm text-text-secondary">Update template details and items.</p>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-auto">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">Name</label>
                  <input
                    value={editTemplateName}
                    onChange={(e) => setEditTemplateName(e.target.value)}
                    className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    placeholder="Template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">Description (optional)</label>
                  <input
                    value={editTemplateDescription}
                    onChange={(e) => setEditTemplateDescription(e.target.value)}
                    className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    placeholder="Short description"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-heading">Template items</h3>
                <button
                  type="button"
                  onClick={addEditItem}
                  className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
                  disabled={loading}
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {editTemplateItems.map((it, idx) => (
                  <div key={it?.id || idx} className="rounded-xl border border-background-dark bg-background-soft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Title</label>
                          <input
                            value={it.title}
                            onChange={(e) => updateEditItem(idx, { title: e.target.value })}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            placeholder="Task title"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Date (optional)</label>
                            <input
                              type="date"
                              value={it.task_date || ''}
                              onChange={(e) => updateEditItem(idx, { task_date: e.target.value || null })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Start time</label>
                            <input
                              type="time"
                              value={it.start_time || ''}
                              onChange={(e) => {
                                const nextStart = e.target.value || null;
                                const nextEnd = ensureMinDuration(nextStart, it.end_time);
                                updateEditItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">End time</label>
                            <input
                              type="time"
                              value={it.end_time || ''}
                              onChange={(e) => {
                                const nextEnd = e.target.value || null;
                                const nextStart = ensureMinDuration(it.start_time, nextEnd);
                                updateEditItem(idx, { start_time: nextStart, end_time: nextEnd });
                              }}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                            <select
                              value={String(it.category || 'other').toLowerCase()}
                              onChange={(e) => updateEditItem(idx, { category: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            >
                              {categoryOptionsForItems.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Priority</label>
                            <select
                              value={it.priority || 'high'}
                              onChange={(e) => updateEditItem(idx, { priority: e.target.value })}
                              className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Reminder</label>
                          <select
                            value={
                              it.reminder_minutes === null || it.reminder_minutes === undefined || it.reminder_minutes === ''
                                ? ''
                                : String(it.reminder_minutes)
                            }
                            onChange={(e) =>
                              updateEditItem(idx, {
                                reminder_minutes: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-full max-w-md rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                          >
                            {REMINDER_MINUTE_OPTIONS.map((opt) => (
                              <option key={opt.value === '' ? 'default' : opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Description (optional)</label>
                          <textarea
                            rows={2}
                            value={it.description || ''}
                            onChange={(e) => updateEditItem(idx, { description: e.target.value })}
                            className="w-full rounded-xl border border-background-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                            placeholder="Task description"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeEditItem(idx)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:text-red-700 transition-colors"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {editTemplateItems.length === 0 && (
                  <div className="text-sm text-text-muted">No items yet. Add one to start building this template.</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-background-dark/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-xl border border-background-dark bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplateEdit}
                className="rounded-xl bg-olive hover:bg-olive-dark text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </SystemAdminLayout>
  );
};

export default SystemAdminTemplatesLayout;
