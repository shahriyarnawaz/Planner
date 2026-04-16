import React from 'react';
import SettingsSectionCard from './SettingsSectionCard';

const ToggleRow = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-xs font-medium text-heading">{label}</span>
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        enabled ? 'border-olive bg-olive text-white' : 'border-background-dark/70 bg-background-soft text-text-secondary'
      }`}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  </div>
);

const NotificationPreferencesSection = ({ emailOn, pushOn, onEmailToggle, onPushToggle }) => {
  return (
    <SettingsSectionCard title="Notifications" description="Control how you receive planner updates and reminders.">
      <div className="space-y-3">
        <ToggleRow label="Email Notifications" enabled={emailOn} onToggle={onEmailToggle} />
        <ToggleRow label="Push Notifications" enabled={pushOn} onToggle={onPushToggle} />
      </div>
    </SettingsSectionCard>
  );
};

export default NotificationPreferencesSection;
