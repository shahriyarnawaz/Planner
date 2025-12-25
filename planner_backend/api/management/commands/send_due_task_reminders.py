"""
Management command to send due task reminders (1 day before / 1 hour before / 15 minutes before).
Run this periodically (recommended: every 1 minute) using cron or scheduler.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from zoneinfo import ZoneInfo

from api.email_notifications import send_task_reminder_email
from api.models import TaskReminder


class Command(BaseCommand):
    help = 'Send scheduled task reminder emails that are due'

    def add_arguments(self, parser):
        parser.add_argument(
            '--window-minutes',
            type=int,
            default=0,
            help='If > 0, only send reminders scheduled within the last N minutes as well. If 0, send ALL due unsent reminders (recommended).',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Do not send emails; only print which reminders would be sent',
        )

    def handle(self, *args, **options):
        window_minutes = options['window_minutes']
        dry_run = options['dry_run']
        pk_tz = ZoneInfo('Asia/Karachi')
        now = timezone.now()
        window_start = now - timedelta(minutes=window_minutes) if window_minutes and window_minutes > 0 else None

        local_now = timezone.localtime(now, pk_tz)
        local_window_start = timezone.localtime(window_start, pk_tz) if window_start is not None else None

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("SENDING DUE TASK REMINDERS"))
        self.stdout.write("=" * 60)
        self.stdout.write(f"Current time (local): {local_now.strftime('%Y-%m-%d %I:%M %p')}")
        if local_window_start is not None:
            self.stdout.write(f"Window (local): {local_window_start.strftime('%Y-%m-%d %I:%M %p')} to {local_now.strftime('%Y-%m-%d %I:%M %p')}")
        else:
            self.stdout.write("Window (local): ALL DUE UNSENT REMINDERS")
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN: emails will NOT be sent"))
        self.stdout.write("-" * 60)

        base_filter = {
            'sent_at__isnull': True,
            'scheduled_for__lte': now,
            'task__completed': False,
        }

        if window_start is not None:
            base_filter['scheduled_for__gte'] = window_start

        due_reminders = (
            TaskReminder.objects
            .filter(**base_filter)
            .select_related('task', 'task__user')
            .order_by('scheduled_for')
        )

        total = due_reminders.count()
        if total == 0:
            self.stdout.write(self.style.WARNING("No due reminders"))
            self.stdout.write("=" * 60 + "\n")
            return

        self.stdout.write(f"Found {total} due reminder(s)\n")

        sent = 0
        failed = 0

        for reminder in due_reminders:
            task = reminder.task
            scheduled_local = timezone.localtime(reminder.scheduled_for, pk_tz)
            self.stdout.write(f"  Reminder ID: {reminder.id}")
            self.stdout.write(f"  Task ID: {task.id}")
            self.stdout.write(f"  Task: {task.title}")
            self.stdout.write(f"  User: {task.user.email}")
            self.stdout.write(f"  Reminder type: {reminder.reminder_type}")
            self.stdout.write(f"  Scheduled for (PK): {scheduled_local.strftime('%Y-%m-%d %I:%M %p')}")

            try:
                if dry_run:
                    sent += 1
                    self.stdout.write(self.style.SUCCESS("  ✅ WOULD SEND (dry-run)"))
                else:
                    sent_at = send_task_reminder_email(
                        task,
                        reminder_type=reminder.reminder_type,
                        scheduled_for=reminder.scheduled_for,
                    )
                    if sent_at:
                        reminder.sent_at = sent_at
                        reminder.save(update_fields=['sent_at'])
                        sent += 1
                        sent_at_local = timezone.localtime(sent_at, pk_tz)
                        self.stdout.write(self.style.SUCCESS(f"  ✅ SENT (PK): {sent_at_local.strftime('%Y-%m-%d %I:%M %p')}"))
                    else:
                        failed += 1
                        self.stdout.write(self.style.ERROR("  ❌ FAILED: send_task_reminder_email returned None"))
            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"  ❌ FAILED: {e}"))

            self.stdout.write("")

        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS("Summary:"))
        self.stdout.write(f"   Due reminders: {total}")
        self.stdout.write(f"   Sent: {sent}")
        self.stdout.write(f"   Failed: {failed}")
        self.stdout.write("=" * 60 + "\n")
