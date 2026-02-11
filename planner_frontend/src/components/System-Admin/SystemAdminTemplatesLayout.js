import React from 'react';
import SystemAdminLayout from './SystemAdminLayout';

const initialCategories = ['Study', 'Work', 'Health', 'Personal', 'Shopping', 'Other'];

const initialTemplates = [
  { id: 1, title: 'Morning Focus Block', category: 'Work', items: 4, isDefault: true },
  { id: 2, title: 'Daily Study Routine', category: 'Study', items: 5, isDefault: true },
  { id: 3, title: 'Evening Workout Plan', category: 'Health', items: 3, isDefault: false },
];

const SystemAdminTemplatesLayout = ({ onNavigate, onLogout }) => {
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [categories, setCategories] = React.useState(initialCategories);
  const [newCategory, setNewCategory] = React.useState('');

  const toggleDefault = (id) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isDefault: !t.isDefault } : t)));
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    if (categories.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    setCategories((prev) => [...prev, value]);
    setNewCategory('');
  };

  return (
    <SystemAdminLayout currentSection="sys_templates" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">Template / Content Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Add/edit default templates, categories, and recommended routines (frontend-only mock data).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white shadow-sm border border-background-dark p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-heading">Default Templates</h2>
              <button
                type="button"
                className="rounded-full bg-olive text-white px-3 py-1.5 text-xs font-semibold hover:bg-olive-dark transition-colors"
              >
                + Add Template
              </button>
            </div>
            <div className="border-t border-background-dark/60 mt-3 mb-4" />

            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-xl border border-background-dark bg-background-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-heading">{t.title}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        Category: <span className="font-medium">{t.category}</span> · Items: <span className="font-medium">{t.items}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDefault(t.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          t.isDefault
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-background-dark text-text-secondary hover:border-primary hover:text-primary'
                        }`}
                      >
                        {t.isDefault ? 'Default' : 'Set Default'}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-background-dark px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                      >
                        Edit
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

            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category"
                className="flex-1 rounded-full border border-background-dark bg-background-soft px-4 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
              <button
                type="button"
                onClick={addCategory}
                className="rounded-full bg-olive text-white px-4 py-2 text-xs font-semibold hover:bg-olive-dark transition-colors"
              >
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border border-background-dark bg-background-soft px-3 py-1 text-xs font-semibold text-text-secondary"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-background-dark/60 bg-background-soft p-4">
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
            </div>
          </div>
        </div>
      </section>
    </SystemAdminLayout>
  );
};

export default SystemAdminTemplatesLayout;
