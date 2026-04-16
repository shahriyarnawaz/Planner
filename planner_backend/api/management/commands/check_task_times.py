"""
Management command to check tasks whose time is over and send notifications
Run this command periodically (e.g., every 15 minutes) using cron or scheduler
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from api.models import Task


class Command(BaseCommand):
    help = 'Check for tasks whose time is over and send email notifications'

    def handle(self, *args, **kwargs):
        pk_tz = ZoneInfo('Asia/Karachi')
        now = timezone.now()
        now_local = timezone.localtime(now, pk_tz)
        today = now_local.date()
        current_time = now_local.time()

        self.stdout.write("=" * 70)
        self.stdout.write("CHECK_TASK_TIMES_DEBUG: start")
        self.stdout.write(
            f"now_utc={now.strftime('%Y-%m-%d %H:%M:%S %z')}, "
            f"now_local={now_local.strftime('%Y-%m-%d %H:%M:%S')}, "
            f"today_local={today}, current_time_local={current_time}"
        )
        
        # Find tasks whose end time has passed
        tasks_to_notify = Task.objects.filter(
            task_date=today,
            end_time__lte=current_time,
            completed=False,
            completion_email_sent=False
        )

        self.stdout.write(f"CHECK_TASK_TIMES_DEBUG: due_candidates={tasks_to_notify.count()}")
        
        notifications_sent = 0
        
        for task in tasks_to_notify:
            try:
                self.stdout.write(
                    "CHECK_TASK_TIMES_DEBUG: candidate "
                    f"id={task.id}, title='{task.title}', user='{task.user.email}', "
                    f"task_date={task.task_date}, start_time={task.start_time}, end_time={task.end_time}, "
                    f"deadline={task.deadline}, completed={task.completed}, "
                    f"completion_email_sent={task.completion_email_sent}"
                )
                task.completed = True
                task.save(update_fields=['completed', 'updated_at'])
                task.refresh_from_db(fields=['completed', 'completion_email_sent', 'updated_at'])
                notifications_sent += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"SENT notification for: {task.title} "
                        f"(task_id={task.id}, completion_email_sent={task.completion_email_sent})"
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"FAILED notification for {task.title} (task_id={task.id}): {e}"
                    )
                )
        
        if notifications_sent > 0:
            self.stdout.write(
                self.style.SUCCESS(f"\nTotal notifications sent: {notifications_sent}")
            )
        else:
            next_upcoming = (
                Task.objects.filter(completed=False, task_date__gte=today, end_time__isnull=False)
                .order_by('task_date', 'end_time')
                .first()
            )
            self.stdout.write(
                self.style.WARNING('No tasks found that need notifications')
            )
            if next_upcoming:
                self.stdout.write(
                    "CHECK_TASK_TIMES_DEBUG: next_upcoming "
                    f"id={next_upcoming.id}, title='{next_upcoming.title}', "
                    f"task_date={next_upcoming.task_date}, end_time={next_upcoming.end_time}, "
                    f"completed={next_upcoming.completed}, completion_email_sent={next_upcoming.completion_email_sent}"
                )
        self.stdout.write("CHECK_TASK_TIMES_DEBUG: end")
        self.stdout.write("=" * 70)


