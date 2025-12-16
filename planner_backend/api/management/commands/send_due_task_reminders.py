"""
Management command to send due task reminders (1 day before / 1 hour before / 15 minutes before).
Run this periodically (recommended: every 1 minute) using cron or scheduler.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.email_notifications import send_task_reminder_email
from api.models import TaskReminder


class Command(BaseCommand):
    help = 'Send scheduled task reminder emails that are due'

    def add_arguments(self, parser):
        parser.add_argument(
            '--window-minutes',
            type=int,
            default=5,
            help='Send reminders scheduled within the last N minutes as well (default: 5)',
        )

    def handle(self, *args, **options):
        window_minutes = options['window_minutes']
        now = timezone.now()
        window_start = now - timedelta(minutes=window_minutes)

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("SENDING DUE TASK REMINDERS"))
        self.stdout.write("=" * 60)
        self.stdout.write(f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S %z')}")
        self.stdout.write(f"Window: {window_start.strftime('%Y-%m-%d %H:%M:%S %z')} to {now.strftime('%Y-%m-%d %H:%M:%S %z')}")
        self.stdout.write("-" * 60)

        due_reminders = (
            TaskReminder.objects
            .filter(
                sent_at__isnull=True,
                scheduled_for__lte=now,
                scheduled_for__gte=window_start,
                task__completed=False,
            )
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
            self.stdout.write(f"  Task: {task.title}")
            self.stdout.write(f"     User: {task.user.email}")
            self.stdout.write(f"     Reminder type: {reminder.reminder_type}")
            self.stdout.write(f"     Scheduled for: {reminder.scheduled_for.strftime('%Y-%m-%d %H:%M:%S %z')}")

            try:
                sent_at = send_task_reminder_email(
                    task,
                    reminder_type=reminder.reminder_type,
                    scheduled_for=reminder.scheduled_for,
                )
                if sent_at:
                    reminder.sent_at = sent_at
                    reminder.save(update_fields=['sent_at'])
                    sent += 1
                    self.stdout.write(self.style.SUCCESS(f"     Sent at: {sent_at.strftime('%Y-%m-%d %H:%M:%S %z')}"))
                else:
                    failed += 1
                    self.stdout.write(self.style.ERROR("     Not sent"))
            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"     Failed: {e}"))

            self.stdout.write("")

        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS("Summary:"))
        self.stdout.write(f"   Due reminders: {total}")
        self.stdout.write(f"   Sent: {sent}")
        self.stdout.write(f"   Failed: {failed}")
        self.stdout.write("=" * 60 + "\n")
