import React from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const SettingsLayout = ({ onNavigate, onLogout }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('18:00');
  const [focusBlock, setFocusBlock] = React.useState('45');
  const [defaultReminder, setDefaultReminder] = React.useState('15');
  const [emailOn, setEmailOn] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: '', text: '' });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;

        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setStartTime(user.work_start_time?.substring(0, 5) || '09:00');
            setEndTime(user.work_end_time?.substring(0, 5) || '18:00');
            setFocusBlock(String(user.focus_duration || '45'));
            setDefaultReminder(String(user.reminder_offset || '15'));
            setEmailOn(!!user.email_notifications);
          }
        }
      } catch (err) {
        console.error('Fetch profile error', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          work_start_time: startTime,
          work_end_time: endTime,
          focus_duration: parseInt(focusBlock),
          reminder_offset: parseInt(defaultReminder),
          email_notifications: emailOn
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data?.message || 'Failed to save settings.' });
      }
    } catch (err) {
      console.error('Save settings error', err);
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
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
                {message.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading whitespace-nowrap">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading whitespace-nowrap">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="border-t border-background-dark/30 my-4" />

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading">Work Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="flex-1 rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-heading">Work End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
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
                      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium border-background-dark/70 bg-background-soft text-text-secondary cursor-not-allowed opacity-50"
                      title="Push notifications are coming soon"
                    >
                      OFF (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </section>
    </AdminLayout>
  );
};

export default SettingsLayout;
