import React from 'react';
import AdminLayout from './AdminLayout';
import ProfileDetailsSection from './Settings/ProfileDetailsSection';
import DailyPreferencesSection from './Settings/DailyPreferencesSection';
import NotificationPreferencesSection from './Settings/NotificationPreferencesSection';
import ChangePasswordModal from './Settings/ChangePasswordModal';
import { parseApiResponse, extractApiErrorMessage } from '../../utils/safeApiResponse';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const SettingsLayout = ({ onNavigate, onLogout }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [workStart, setWorkStart] = React.useState('09:00');
  const [workEnd, setWorkEnd] = React.useState('22:00');
  const [focusBlock, setFocusBlock] = React.useState('45');
  const [defaultReminder, setDefaultReminder] = React.useState('15');
  const [emailOn, setEmailOn] = React.useState(true);
  const [pushOn, setPushOn] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordMessage, setPasswordMessage] = React.useState('');

  React.useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('You must be logged in to view settings.');
      return;
    }

    const controller = new AbortController();
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        const { data } = await parseApiResponse(response);
        if (!response.ok) {
          throw new Error(extractApiErrorMessage(response, data, 'Failed to load settings.'));
        }

        const user = data?.user || {};
        const normalizeTime = (value, fallback) => {
          if (!value || typeof value !== 'string') return fallback;
          const m = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
          if (!m) return fallback;
          return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
        };

        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setEmail(user.email || '');
        setWorkStart(normalizeTime(user.work_start_time, '09:00'));
        setWorkEnd(normalizeTime(user.work_end_time, '22:00'));
        setFocusBlock(String(user.focus_block_minutes ?? 45));
        setDefaultReminder(String(user.preferred_reminder_minutes ?? 15));
        setEmailOn(Boolean(user.email_notifications_enabled ?? true));
        setPushOn(Boolean(user.push_notifications_enabled ?? true));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Something went wrong while loading settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('You must be logged in to save settings.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          work_start_time: workStart,
          work_end_time: workEnd,
          focus_block_minutes: Number(focusBlock),
          preferred_reminder_minutes: Number(defaultReminder),
          email_notifications_enabled: emailOn,
          push_notifications_enabled: pushOn,
        }),
      });
      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(extractApiErrorMessage(response, data, 'Failed to save settings.'));
      }

      setMessage(data?.message || 'Settings saved successfully.');

      if (data?.user) {
        try {
          const existing = JSON.parse(localStorage.getItem('user') || '{}');
          const merged = {
            ...existing,
            ...data.user,
          };
          localStorage.setItem('user', JSON.stringify(merged));
        } catch (storageErr) {
          // ignore localStorage parsing errors
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const closeChangePasswordModal = () => {
    if (passwordSaving) return;
    setChangePasswordOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordMessage('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setPasswordError('You must be logged in to change password.');
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password must match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const { data } = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(extractApiErrorMessage(response, data, 'Failed to change password.'));
      }

      setPasswordMessage(data?.message || 'Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Something went wrong while changing password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AdminLayout currentSection="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <section className="flex-1 px-6 lg:px-10 py-6 bg-background-soft flex flex-col">
        <div className="max-w-4xl w-full">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-heading">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage your profile, daily preferences, and notification controls.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            {loading && <p className="text-xs text-body">Loading settings...</p>}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {message && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{message}</p>
            )}

            <ProfileDetailsSection
              firstName={firstName}
              lastName={lastName}
              email={email}
              onFirstNameChange={(e) => setFirstName(e.target.value)}
              onLastNameChange={(e) => setLastName(e.target.value)}
              onEmailChange={(e) => setEmail(e.target.value)}
              onChangePasswordClick={() => setChangePasswordOpen(true)}
            />

            <DailyPreferencesSection
              workStart={workStart}
              workEnd={workEnd}
              focusBlock={focusBlock}
              defaultReminder={defaultReminder}
              onWorkStartChange={(e) => setWorkStart(e.target.value)}
              onWorkEndChange={(e) => setWorkEnd(e.target.value)}
              onFocusBlockChange={(e) => setFocusBlock(e.target.value)}
              onDefaultReminderChange={(e) => setDefaultReminder(e.target.value)}
            />

            <NotificationPreferencesSection
              emailOn={emailOn}
              pushOn={pushOn}
              onEmailToggle={() => setEmailOn((prev) => !prev)}
              onPushToggle={() => setPushOn((prev) => !prev)}
            />

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={loading || saving}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        oldPassword={oldPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onOldPasswordChange={(e) => setOldPassword(e.target.value)}
        onNewPasswordChange={(e) => setNewPassword(e.target.value)}
        onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
        onClose={closeChangePasswordModal}
        onSubmit={handleChangePassword}
        saving={passwordSaving}
        error={passwordError}
        successMessage={passwordMessage}
      />
    </AdminLayout>
  );
};

export default SettingsLayout;
