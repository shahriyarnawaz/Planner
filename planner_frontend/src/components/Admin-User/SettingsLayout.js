import React from 'react';
import AdminLayout from './AdminLayout';

const SettingsLayout = ({ onNavigate, onLogout }) => {
  const [workHours, setWorkHours] = React.useState('09:00 – 22:00');
  const [focusBlock, setFocusBlock] = React.useState('45');
  const [defaultReminder, setDefaultReminder] = React.useState('15');
  const [emailOn, setEmailOn] = React.useState(true);
  const [pushOn, setPushOn] = React.useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    // Placeholder: wire to backend later
  };

  return (
    <AdminLayout currentSection="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
        <div className="max-w-xl w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-heading">Settings</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Configure your work hours, focus blocks, and notifications.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSave}
              className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 space-y-4 text-sm"
            >
              <h2 className="text-sm font-semibold text-heading mb-1">Profile Settings</h2>
              <div className="border-t border-background-dark/60 mb-2" />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading">Work Hours</label>
                  <input
                    type="text"
                    value={workHours}
                    onChange={(e) => setWorkHours(e.target.value)}
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading">Focus Block (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    value={focusBlock}
                    onChange={(e) => setFocusBlock(e.target.value)}
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading">Default Reminder (minutes before)</label>
                  <input
                    type="number"
                    min="0"
                    value={defaultReminder}
                    onChange={(e) => setDefaultReminder(e.target.value)}
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="pt-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-heading">Email Notifications</span>
                    <button
                      type="button"
                      onClick={() => setEmailOn((prev) => !prev)}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        emailOn
                          ? 'border-olive bg-olive text-white'
                          : 'border-background-dark/70 bg-background-soft text-text-secondary'
                      }`}
                    >
                      {emailOn ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-heading">Push Notifications</span>
                    <button
                      type="button"
                      onClick={() => setPushOn((prev) => !prev)}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        pushOn
                          ? 'border-olive bg-olive text-white'
                          : 'border-background-dark/70 bg-background-soft text-text-secondary'
                      }`}
                    >
                      {pushOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </section>
    </AdminLayout>
  );
};

export default SettingsLayout;
