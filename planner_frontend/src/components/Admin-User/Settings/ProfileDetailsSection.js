import React from 'react';
import SettingsSectionCard from './SettingsSectionCard';

const inputClassName =
  'w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary';

const ProfileDetailsSection = ({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onChangePasswordClick,
}) => {
  return (
    <SettingsSectionCard title="Profile Details" description="Update your personal identity information.">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">First Name</label>
          <input type="text" value={firstName} onChange={onFirstNameChange} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">Last Name</label>
          <input type="text" value={lastName} onChange={onLastNameChange} className={inputClassName} />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <label className="text-xs font-medium text-heading">Email</label>
        <input type="email" value={email} onChange={onEmailChange} className={inputClassName} />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onChangePasswordClick}
          className="px-4 py-2 rounded-lg border border-background-dark text-xs font-semibold text-body hover:bg-background-dark/30 transition-colors"
        >
          Change Password
        </button>
      </div>
    </SettingsSectionCard>
  );
};

export default ProfileDetailsSection;
