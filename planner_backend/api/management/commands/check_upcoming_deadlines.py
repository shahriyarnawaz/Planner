"""
Management command to check upcoming deadline tasks
Run this periodically (e.g., every hour) to send reminders
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Task
from api.email_notifications import send_task_reminder_email


class Command(BaseCommand):
    help = 'Check for upcoming deadline tasks and send reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Check tasks with deadlines within this many hours (default: 24)',
        )
        parser.add_argument(
            '--send-email',
            action='store_true',
            help='Send email reminders for upcoming tasks',
        )

    def handle(self, *args, **options):
        hours_ahead = options['hours']
        send_email = options['send_email']
        
        now = timezone.now()
        future_time = now + timedelta(hours=hours_ahead)
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("🔔 CHECKING UPCOMING DEADLINE TASKS"))
        self.stdout.write("="*60)
        self.stdout.write(f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}")
        self.stdout.write(f"Checking tasks with deadlines within {hours_ahead} hours")
        self.stdout.write(f"Deadline range: {now.strftime('%Y-%m-%d %H:%M:%S')} to {future_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.stdout.write("-"*60)
        
        # Find tasks with upcoming deadlines
        upcoming_tasks = Task.objects.filter(
            deadline__gte=now,
            deadline__lte=future_time,
            completed=False
        ).select_related('user').order_by('deadline')
        
        total_count = upcoming_tasks.count()
        
        if total_count == 0:
            self.stdout.write(self.style.WARNING(f"\n📭 No upcoming deadline tasks found (within {hours_ahead} hours)"))
            self.stdout.write("="*60 + "\n")
            return
        
        self.stdout.write(f"\n📋 Found {total_count} upcoming deadline task(s):\n")
        
        emails_sent = 0
        
        for task in upcoming_tasks:
            time_until = task.deadline - now
            hours_until = int(time_until.total_seconds() / 3600)
            minutes_until = int((time_until.total_seconds() % 3600) / 60)
            
            # Format time until deadline
            if hours_until > 0:
                time_str = f"{hours_until} hour(s) and {minutes_until} minute(s)"
            else:
                time_str = f"{minutes_until} minute(s)"
            
            self.stdout.write(f"  📌 Task: {task.title}")
            self.stdout.write(f"     User: {task.user.email}")
            self.stdout.write(f"     Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M:%S')}")
            self.stdout.write(f"     Time until: {time_str}")
            self.stdout.write(f"     Priority: {task.get_priority_display()}")
            self.stdout.write(f"     Category: {task.get_category_display()}")
            
            # Send email reminder if requested
            if send_email:
                try:
                    # Check if reminder was already sent (you might want to add a field for this)
                    send_task_reminder_email(task)
                    emails_sent += 1
                    self.stdout.write(self.style.SUCCESS(f"     ✅ Reminder email sent"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"     ❌ Failed to send email: {e}"))
            
            self.stdout.write("")
        
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS(f"\n✅ Summary:"))
        self.stdout.write(f"   Total upcoming tasks: {total_count}")
        if send_email:
            self.stdout.write(f"   Emails sent: {emails_sent}")
        self.stdout.write("="*60 + "\n")
        
        # Return data for API usage
        return {
            'total': total_count,
            'tasks': upcoming_tasks,
            'emails_sent': emails_sent if send_email else 0
        }

