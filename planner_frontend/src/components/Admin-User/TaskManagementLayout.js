import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import CreateTaskForm from './CreateTaskForm';

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
  const filtersRef = React.useRef(null);

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

  const tasks = [
    {
      id: 1,
      title: 'Study Math',
      date: '16 Dec 2025',
      startTime: '09:00',
      endTime: '09:30',
      time: '09:00 – 09:30',
      category: 'Study',
      priority: 'High',
      reminder: '15 min before',
      description: 'Chapter 5',
      done: false,
    },
    {
      id: 2,
      title: 'Project Meeting',
      date: '16 Dec 2025',
      startTime: '11:00',
      endTime: '12:00',
      time: '11:00 – 12:00',
      category: 'Work',
      priority: 'Medium',
      reminder: '30 min before',
      description: 'Sprint planning sync',
      done: false,
    },
    {
      id: 3,
      title: 'Workout',
      date: '16 Dec 2025',
      startTime: '18:00',
      endTime: '19:00',
      time: '18:00 – 19:00',
      category: 'Health',
      priority: 'Low',
      reminder: '1 hour before',
      description: 'Evening gym session',
      done: true,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar currentSection="tasks" onNavigate={onNavigate} />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <AdminHeader />

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
                onSelect={() => setOpenFilter(null)}
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
                onSelect={() => setOpenFilter(null)}
              />
            </div>

            {/* Task list */}
            <div className="rounded-2xl bg-white border border-background-dark shadow-sm overflow-hidden mb-6">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm text-body ${
                    index !== tasks.length - 1 ? 'border-b border-background-dark/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={task.done}
                      className="h-4 w-4 rounded border-background-dark text-primary focus:ring-primary-light"
                    />
                    <span className={task.done ? 'line-through text-muted' : 'font-medium text-heading'}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-text-secondary">{task.time}</span>
                    <span
                      className="inline-flex items-center rounded-full border border-background-dark px-2 py-0.5 text-[11px] uppercase tracking-wide"
                    >
                      {task.priority}
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
              ))}
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
                  <CreateTaskForm />
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
                      <span className="text-body">{viewTask.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Time:</span>
                      <span className="text-body">{viewTask.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Category:</span>
                      <span className="text-body">{viewTask.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Priority:</span>
                      <span className="text-body">{viewTask.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Reminder:</span>
                      <span className="text-body">{viewTask.reminder}</span>
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
                        defaultValue={editTask.title}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Date</label>
                      <input
                        type="text"
                        defaultValue={editTask.date}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Start Time</label>
                      <input
                        type="time"
                        defaultValue={editTask.startTime}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">End Time</label>
                      <input
                        type="time"
                        defaultValue={editTask.endTime}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-heading">Priority</label>
                      <select
                        defaultValue={editTask.priority}
                        className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditTask(null)}
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
                      onClick={() => setDeleteTask(null)}
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
      </main>
    </div>
  );
};

export default TaskManagementLayout;
