import React from 'react';
import SettingsSectionCard from './SettingsSectionCard';

const inputClassName =
  'w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2 text-body text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary';

const DailyPreferencesSection = ({
  workStart,
  workEnd,
  focusBlock,
  defaultReminder,
  onWorkStartChange,
  onWorkEndChange,
  onFocusBlockChange,
  onDefaultReminderChange,
}) => {
  return (
    <SettingsSectionCard
      title="Daily Preferences"
      description="Set your work hours, focus duration, and default reminder lead time."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">Work Start</label>
          <input type="time" value={workStart} onChange={onWorkStartChange} className={inputClassName} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">Work End</label>
          <input type="time" value={workEnd} onChange={onWorkEndChange} className={inputClassName} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">Focus Block (minutes)</label>
          <input
            type="number"
            min="15"
            value={focusBlock}
            onChange={onFocusBlockChange}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-heading">Preferred Reminder (minutes before)</label>
          <input
            type="number"
            min="0"
            value={defaultReminder}
            onChange={onDefaultReminderChange}
            className={inputClassName}
          />
        </div>
      </div>
    </SettingsSectionCard>
  );
};

export default DailyPreferencesSection;
