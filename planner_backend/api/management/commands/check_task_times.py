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
        
        # Find tasks whose end time has passed
        tasks_to_notify = Task.objects.filter(
            task_date=today,
            end_time__lte=current_time,
            completed=False,
            completion_email_sent=False
        )
        
        notifications_sent = 0
        
        for task in tasks_to_notify:
            try:
                task.completed = True
                task.save(update_fields=['completed', 'updated_at'])
                notifications_sent += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Sent notification for: {task.title}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Failed to send notification for {task.title}: {e}')
                )
        
        if notifications_sent > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n📧 Total notifications sent: {notifications_sent}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('📭 No tasks found that need notifications')
            )


