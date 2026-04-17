/**
 * Reminder lead time (minutes before task start), shared by:
 * CreateTaskForm, TemplatesLayout (use template), SystemAdminTemplatesLayout.
 * Must stay in sync with API: Task.reminder_minutes / TaskTemplateItem.reminder_minutes (0–1440, null = account default).
 */

export const DEFAULT_REMINDER_MINUTES = 15;

export const REMINDER_MINUTE_OPTIONS = [
  { value: '', label: 'Account default' },
  { value: '0', label: '0 min (at start)' },
  { value: '5', label: '5 min before' },
  { value: '15', label: '15 min before' },
  { value: '30', label: '30 min before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '24 hours before' },
];

/** Parse API / form value; invalid or empty → null (account default). */
export function normalizeReminderMinutes(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1440) return null;
  return Math.round(n);
}
