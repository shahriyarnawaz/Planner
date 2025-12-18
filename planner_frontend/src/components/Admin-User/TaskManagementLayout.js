import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import CreateTaskForm from './CreateTaskForm';

const TaskManagementLayout = ({ onNavigate }) => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const tasks = [
    { id: 1, title: 'Study Math', time: '09:00 – 09:30', priority: 'High', done: false },
    { id: 2, title: 'Project Meeting', time: '11:00 – 12:00', priority: 'Medium', done: false },
    { id: 3, title: 'Workout', time: '18:00 – 19:00', priority: 'Low', done: true },
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
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {showCreateForm ? 'Close Create Task' : 'Create Task'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <span className="font-medium text-heading">Filter:</span>
              <select className="rounded-full border border-background-dark bg-background-soft px-3 py-1.5 text-body text-xs focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary">
                <option>Category</option>
                <option>Study</option>
                <option>Work</option>
                <option>Personal</option>
              </select>
              <select className="rounded-full border border-background-dark bg-background-soft px-3 py-1.5 text-body text-xs focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary">
                <option>Date</option>
                <option>Today</option>
                <option>Tomorrow</option>
              </select>
              <select className="rounded-full border border-background-dark bg-background-soft px-3 py-1.5 text-body text-xs focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary">
                <option>Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
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
                  </div>
                </div>
              ))}
            </div>

            {/* Create Task form (popup modal) */}
            {showCreateForm && (
              <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
                {/* Backdrop */}
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="absolute inset-0 bg-black/40 cursor-default"
                  aria-label="Close create task"
                />

                {/* Modal content */}
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
          </div>
        </section>
      </main>
    </div>
  );
};

export default TaskManagementLayout;
