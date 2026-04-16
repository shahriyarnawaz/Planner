import React from 'react';

const inputClassName =
  'w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary';

const ChangePasswordModal = ({
  isOpen,
  oldPassword,
  newPassword,
  confirmPassword,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onClose,
  onSubmit,
  saving,
  error,
  successMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 cursor-default"
        aria-label="Close change password modal"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-background-dark shadow-lg p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-background-dark flex items-center justify-center text-sm text-muted hover:text-primary hover:border-primary shadow-sm"
          aria-label="Close change password modal"
          disabled={saving}
        >
          ×
        </button>

        <h3 className="text-lg font-semibold text-heading">Change Password</h3>
        <p className="text-xs text-text-secondary mt-1 mb-4">
          Enter your current password and set a new one.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-heading">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={onOldPasswordChange}
              className={inputClassName}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-heading">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={onNewPasswordChange}
              className={inputClassName}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-heading">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              className={inputClassName}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          {successMessage && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {successMessage}
            </p>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-background-dark text-xs font-semibold text-body hover:bg-background-dark/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold text-white shadow-md hover:shadow-lg transition-colors"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
