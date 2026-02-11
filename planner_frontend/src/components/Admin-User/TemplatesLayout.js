import React from 'react';
import AdminLayout from './AdminLayout';

const globalTemplates = [
  { id: 1, name: 'Morning Routine', taskCount: 5 },
  { id: 2, name: 'Study Session', taskCount: 4 },
  { id: 3, name: 'Workout', taskCount: 6 },
];

const bookmarkedTemplates = [
  { id: 11, name: 'My Morning Plan', taskCount: 5 },
  { id: 12, name: 'Exam Study Plan', taskCount: 6 },
];

const TemplatesLayout = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = React.useState('templates'); // 'templates' | 'bookmarks'

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
                          className="px-3 py-1 rounded-full border border-background-dark/70 text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-colors"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full border border-accent-gold text-[11px] text-accent-gold hover:bg-accent-gold hover:text-white transition-colors"
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
                  {bookmarkedTemplates.map((tpl) => (
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
                          className="px-3 py-1 rounded-full border border-background-dark/70 text-body hover:bg-cream-dark/60 hover:text-heading transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition-colors"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full border border-olive text-olive hover:bg-olive hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
    </AdminLayout>
  );
};

export default TemplatesLayout;
