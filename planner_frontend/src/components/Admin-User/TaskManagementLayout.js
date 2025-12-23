import React from 'react';
import AdminLayout from './AdminLayout';
import CreateTaskForm from './CreateTaskForm';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const FilterDropdown = ({ label, options, isOpen, onToggle, onSelect }) => {
  const [selectedLabel, setSelectedLabel] = React.useState(label);

  const handleSelect = (option) => {
    setSelectedLabel(option.label);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="relative text-[11px] md:text-xs">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center justify-between gap-1 rounded-full border border-background-dark/70 bg-cream-dark/40 px-3 py-1.5 text-body shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
      >
        <span>{selectedLabel}</span>
        <span className="text-[9px] text-muted">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-40 rounded-xl border border-background-dark bg-cream-dark shadow-lg py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="block w-full px-3 py-1.5 text-left text-[11px] md:text-xs text-body hover:bg-olive hover:text-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskManagementLayout = ({ onNavigate }) => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [openFilter, setOpenFilter] = React.useState(null);
  const [viewTask, setViewTask] = React.useState(null);
  const [editTask, setEditTask] = React.useState(null);
  const [deleteTask, setDeleteTask] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [tasksLoading, setTasksLoading] = React.useState(false);
  const [tasksError, setTasksError] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('');
  const [filterPriority, setFilterPriority] = React.useState('');
  const [editTitle, setEditTitle] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editStartTime, setEditStartTime] = React.useState('');
  const [editEndTime, setEditEndTime] = React.useState('');
  const [editPriorityValue, setEditPriorityValue] = React.useState('medium');
  const [editCategory, setEditCategory] = React.useState('study');
  const [editDescription, setEditDescription] = React.useState('');
  const [editError, setEditError] = React.useState('');
  const filtersRef = React.useRef(null);

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

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTasks([]);
      setTasksError('You must be logged in to view tasks.');
      return;
    }

    const controller = new AbortController();

    const fetchTasks = async () => {
      setTasksError('');
      setTasksLoading(true);

      try {
        const params = new URLSearchParams();
        if (filterCategory) {
          params.append('category', filterCategory);
        }
        if (filterPriority) {
          params.append('priority', filterPriority);
        }
        const query = params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(`${API_BASE_URL}/tasks/${query}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          const backendError = data?.error || data?.detail;
          setTasksError(backendError || 'Failed to load tasks.');
          setTasks([]);
          setTasksLoading(false);
          return;
        }

        const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        setTasks(results);
        setTasksLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch tasks error', err);
        setTasksError('Something went wrong while loading tasks.');
        setTasks([]);
        setTasksLoading(false);
      }
    };

    fetchTasks();

    return () => controller.abort();
  }, [filterCategory, filterPriority]);

  React.useEffect(() => {
    if (editTask) {
      const parseTimeTo24 = (value) => {
        if (!value || typeof value !== 'string') return '';
        const trimmed = value.trim();

        // Already 24-hour: "HH:MM" or "HH:MM:SS"
        const m24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
        if (m24) {
          return `${m24[1].padStart(2, '0')}:${m24[2]}`;
        }

        // 12-hour: "H:MM AM" or "HH:MM PM"
        const m12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
        if (m12) {
          let hours = Number(m12[1]);
          const minutes = m12[2];
          const ampm = m12[3].toUpperCase();
          if (ampm === 'AM') {
            if (hours === 12) hours = 0;
          } else {
            if (hours !== 12) hours += 12;
          }
          return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return '';
      };

      const formatTimeTo12 = (value) => {
        const t24 = parseTimeTo24(value);
        if (!t24) return '';
        const [hhStr, mm] = t24.split(':');
        const hh = Number(hhStr);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 === 0 ? 12 : hh % 12;
        return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
      };

      const normalizeDate = (value) => {
        if (!value || typeof value !== 'string') return '';
        if (value.includes('T')) {
          return value.split('T')[0];
        }
        return value;
      };

      const normalizeTime = (value) => parseTimeTo24(value);

      setEditTitle(editTask.title || '');
      setEditDate(normalizeDate(editTask.task_date));
      setEditStartTime(normalizeTime(editTask.start_time));
      setEditEndTime(normalizeTime(editTask.end_time));
      setEditPriorityValue(editTask.priority || 'medium');
      setEditCategory(editTask.category || 'study');
      setEditDescription(editTask.description || '');
      setEditError('');
    }
  }, [editTask]);

  const formatTimeTo12 = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();

    // If backend already sends "11:38 PM" just normalize spacing/case
    const m12 = trimmed.match(/^(\d{1,2}:\d{2})\s*([AP]M)$/i);
    if (m12) {
      return `${m12[1]} ${m12[2].toUpperCase()}`;
    }

    // Parse 24-hour and convert
    const m24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (!m24) return trimmed;
    const hh = Number(m24[1]);
    const mm = m24[2];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
  };

  const capitalize = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleTaskCreated = (createdTask) => {
    setTasks((prev) => [createdTask, ...prev]);
  };

  const handleToggleComplete = async (taskId) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTasksError('You must be logged in to update tasks.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle-complete/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError = data?.error || data?.detail;
        setTasksError(backendError || 'Failed to update task.');
        return;
      }

      if (data?.task) {
        setTasks((prev) => prev.map((task) => (task.id === data.task.id ? data.task : task)));
      }
    } catch (err) {
      console.error('Toggle complete error', err);
      setTasksError('Something went wrong while updating the task.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTask) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setTasksError('You must be logged in to delete tasks.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${deleteTask.id}/delete/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const backendError = data?.error || data?.detail;
        setTasksError(backendError || 'Failed to delete task.');
        return;
      }

      setTasks((prev) => prev.filter((task) => task.id !== deleteTask.id));
      setDeleteTask(null);
    } catch (err) {
      console.error('Delete task error', err);
      setTasksError('Something went wrong while deleting the task.');
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setEditError('You must be logged in to update tasks.');
      return;
    }

    setEditError('');

    if (!editTitle || !editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editTask.id}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: editTitle,
          task_date: editDate || null,
          start_time: editStartTime || null,
          end_time: editEndTime || null,
          priority: editPriorityValue,
          category: editCategory,
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError = data?.error || data?.detail || data?.non_field_errors?.[0];
        if (backendError) {
          setEditError(backendError);
        } else if (typeof data === 'object') {
          const keys = Object.keys(data || {});
          const firstKey = keys[0];
          const firstMessage = firstKey
            ? Array.isArray(data[firstKey])
              ? data[firstKey][0]
              : data[firstKey]
            : null;
          setEditError(firstMessage || 'Failed to update task.');
        } else {
          setEditError('Failed to update task.');
        }
        return;
      }

      if (data?.task) {
        setTasks((prev) => prev.map((task) => (task.id === data.task.id ? data.task : task)));
      }

      setEditTask(null);
    } catch (err) {
      console.error('Update task error', err);
      setEditError('Something went wrong while updating the task.');
    }
  };

  return (
    <AdminLayout currentSection="tasks" onNavigate={onNavigate}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
        <div className="max-w-4xl w-full">
            {/* Header + Create button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-heading">Tasks</h1>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm((prev) => !prev);
                  setViewTask(null);
                  setEditTask(null);
                  setDeleteTask(null);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {showCreateForm ? 'Close Create Task' : 'Create Task'}
              </button>
            </div>

            {/* Filters */}
            <div
              className="flex flex-wrap items-center gap-3 mb-4 text-xs md:text-sm"
              ref={filtersRef}
            >
              <span className="font-medium text-heading mr-1">Filter:</span>

              <FilterDropdown
                label="Category"
                options={[
                  { value: 'category', label: 'Category' },
                  { value: 'study', label: 'Study' },
                  { value: 'work', label: 'Work' },
                  { value: 'personal', label: 'Personal' },
                ]}
                isOpen={openFilter === 'category'}
                onToggle={() =>
                  setOpenFilter((prev) => (prev === 'category' ? null : 'category'))
                }
                onSelect={(option) => {
                  setOpenFilter(null);
                  if (option.value === 'category') {
                    setFilterCategory('');
                  } else {
                    setFilterCategory(option.value);
                  }
                }}
              />

              <FilterDropdown
                label="Date"
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'today', label: 'Today' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                ]}
                isOpen={openFilter === 'date'}
                onToggle={() =>
                  setOpenFilter((prev) => (prev === 'date' ? null : 'date'))
                }
                onSelect={() => setOpenFilter(null)}
              />

              <FilterDropdown
                label="Priority"
                options={[
                  { value: 'priority', label: 'Priority' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                isOpen={openFilter === 'priority'}
                onToggle={() =>
                  setOpenFilter((prev) => (prev === 'priority' ? null : 'priority'))
                }
                onSelect={(option) => {
                  setOpenFilter(null);
                  if (option.value === 'priority') {
                    setFilterPriority('');
                  } else {
                    setFilterPriority(option.value);
                  }
                }}
              />

            </div>

            {/* Task list */}
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm overflow-hidden mb-6">
              {tasksLoading ? (
                <div className="px-4 py-6 text-sm text-body">Loading tasks...</div>
              ) : tasksError ? (
                <div className="px-4 py-6 text-sm text-red-600">{tasksError}</div>
              ) : tasks.length === 0 ? (
                <div className="px-4 py-6 text-sm text-body">No tasks found.</div>
              ) : (
                tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between px-4 py-3 text-sm text-body ${
                      index !== tasks.length - 1 ? 'border-b border-background-dark/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => handleToggleComplete(task.id)}
                        className="h-4 w-4 rounded border-background-dark text-primary focus:ring-primary-light"
                      />
                      <span
                        className={
                          task.completed ? 'line-through text-muted' : 'font-medium text-heading'
                        }
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-text-secondary">
                        {task.start_time && task.end_time
                          ? `${formatTimeTo12(task.start_time)} – ${formatTimeTo12(task.end_time)}`
                          : task.deadline || '--'}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full border border-background-dark px-2 py-0.5 text-[11px] uppercase tracking-wide"
                      >
                        {capitalize(task.priority)}
                      </span>

                      <div className="flex items-center gap-2 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewTask(task);
                            setEditTask(null);
                            setDeleteTask(null);
                            setShowCreateForm(false);
                          }}
                          className="h-7 w-7 rounded-full border border-background-dark/60 flex items-center justify-center text-[13px] text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                          aria-label="View task"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 5C7 5 3.3 8.1 2 12c1.3 3.9 5 7 10 7s8.7-3.1 10-7c-1.3-3.9-5-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditTask(task);
                            setViewTask(null);
                            setDeleteTask(null);
                            setShowCreateForm(false);
                          }}
                          className="h-7 w-7 rounded-full border border-olive/70 flex items-center justify-center text-[13px] text-olive hover:bg-olive hover:text-white transition-colors"
                          aria-label="Edit task"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <path
                              d="M4 17.5V20h2.5L17 9.5l-2.5-2.5L4 17.5Zm14.7-9.8a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0L13.9 5.7 16.4 8.2l2.3-1.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTask(task);
                            setViewTask(null);
                            setEditTask(null);
                            setShowCreateForm(false);
                          }}
                          className="h-7 w-7 rounded-full border border-red-300 flex items-center justify-center text-[13px] text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          aria-label="Delete task"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          >
                            <path
                              d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recurring Task Detected card */}
            <div className="mt-4 max-w-4xl rounded-2xl bg-white shadow-sm border border-background-dark p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="text-xl mt-0.5">🔁</div>
                <div className="flex-1 text-sm text-body">
                  <h2 className="text-sm font-semibold text-heading mb-1">Recurring Task Detected</h2>
                  <p>You studied "Math" at 8 PM for the last 5 days.</p>
                  <p className="mt-1">Would you like to make this a daily task?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Make Recurring
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl border border-background-dark px-4 py-1.5 text-xs font-semibold text-heading bg-background-soft hover:bg-background-dark/40 transition-colors duration-150"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Task form (popup modal) */}
            {showCreateForm && (
              <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="absolute inset-0 bg-black/40 cursor-default"
                  aria-label="Close create task"
                />

                <div className="relative z-50 max-w-xl w-full">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                    aria-label="Close create task"
                  >
                    ×
                  </button>
                  <CreateTaskForm
                    onTaskCreated={handleTaskCreated}
                    onClose={() => setShowCreateForm(false)}
                  />
                </div>
              </div>
            )}

            {viewTask && (
              <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
                <button
                  type="button"
                  onClick={() => setViewTask(null)}
                  className="absolute inset-0 bg-black/40 cursor-default"
                  aria-label="Close task details"
                />

                <div className="relative z-50 max-w-md w-full rounded-2xl bg-white border border-background-dark shadow-lg p-6">
                  <button
                    type="button"
                    onClick={() => setViewTask(null)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                    aria-label="Close task details"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold text-heading mb-3">Task Details</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Title:</span>
                      <span className="font-medium text-heading">{viewTask.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Date:</span>
                      <span className="text-body">{viewTask.task_date || '--'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Time:</span>
                      <span className="text-body">
                        {viewTask.start_time && viewTask.end_time
                          ? `${formatTimeTo12(viewTask.start_time)} – ${formatTimeTo12(viewTask.end_time)}`
                          : viewTask.deadline || '--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Category:</span>
                      <span className="text-body">{capitalize(viewTask.category)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Priority:</span>
                      <span className="text-body">{capitalize(viewTask.priority)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Duration:</span>
                      <span className="text-body">
                        {viewTask.duration != null || viewTask.calculated_duration != null
                          ? `${(viewTask.duration ?? viewTask.calculated_duration)} min`
                          : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-text-secondary">Description:</span>
                      <span className="text-body text-right max-w-[60%]">
                        {viewTask.description}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setViewTask(null)}
                      className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editTask && (
              <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="absolute inset-0 bg-black/40 cursor-default"
                  aria-label="Close edit task"
                />

                <div className="relative z-50 max-w-md w-full rounded-2xl bg-white border border-background-dark shadow-lg p-6">
                  <button
                    type="button"
                    onClick={() => setEditTask(null)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                    aria-label="Close edit task"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold text-heading mb-3">Edit Task</h2>
                  <div className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Start Time</label>
                      <input
                        type="time"
                        value={editStartTime}
                        onChange={(e) => {
                          const nextStart = e.target.value;
                          setEditStartTime(nextStart);
                          setEditEndTime((prev) => ensureMinDuration(nextStart, prev));
                        }}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">End Time</label>
                      <input
                        type="time"
                        value={editEndTime}
                        onChange={(e) => {
                          const nextEnd = e.target.value;
                          setEditEndTime(ensureMinDuration(editStartTime, nextEnd));
                        }}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Priority</label>
                      <select
                        value={editPriorityValue}
                        onChange={(e) => setEditPriorityValue(e.target.value)}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      >
                        <option value="study">Study</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="health">Health</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Description</label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
                      />
                    </div>
                    {editError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {editError}
                      </p>
                    )}
                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleUpdateTask}
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
                      >
                        Update Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deleteTask && (
              <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
                <button
                  type="button"
                  onClick={() => setDeleteTask(null)}
                  className="absolute inset-0 bg-black/40 cursor-default"
                  aria-label="Close delete confirmation"
                />

                <div className="relative z-50 max-w-sm w-full rounded-2xl bg-white border border-background-dark shadow-lg p-6">
                  <button
                    type="button"
                    onClick={() => setDeleteTask(null)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
                    aria-label="Close delete confirmation"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold text-heading mb-2">Delete Task</h2>
                  <p className="text-sm text-body mb-4">
                    Are you sure you want to delete "{deleteTask.title}"?
                  </p>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeleteTask(null)}
                      className="px-3 py-1.5 rounded-lg border border-background-dark/70 text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
    </AdminLayout>
  );
};

export default TaskManagementLayout;
