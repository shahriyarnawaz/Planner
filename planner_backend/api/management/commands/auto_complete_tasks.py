from time import sleep
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from zoneinfo import ZoneInfo

from api.models import Task


class Command(BaseCommand):
    help = 'Automatically mark tasks as completed when their end time is reached'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval-seconds',
            type=int,
            default=15,
            help='How often to poll for due tasks (default: 15 seconds)',
        )
        parser.add_argument(
            '--once',
            action='store_true',
            help='Run a single check and exit',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Do not update DB; only print what would be updated',
        )

    def _run_once(self, *, dry_run: bool) -> int:
        now = timezone.now()
        pk_tz = ZoneInfo('Asia/Karachi')
        now_local = timezone.localtime(now, pk_tz)
        today_local = now_local.date()
        current_time_local = now_local.time()

        due_tasks_qs = (
            Task.objects
            .filter(
                completed=False,
            )
            .filter(
                Q(deadline__isnull=False, deadline__lte=now)
                | Q(
                    deadline__isnull=True,
                    task_date__lt=today_local,
                    end_time__isnull=False,
                )
                | Q(
                    deadline__isnull=True,
                    task_date=today_local,
                    end_time__isnull=False,
                    end_time__lte=current_time_local,
                )
            )
            .select_related('user')
            .order_by('deadline', 'task_date', 'end_time')
        )

        due_tasks = list(due_tasks_qs)

        self.stdout.write(
            f"[{now_local.strftime('%Y-%m-%d %H:%M:%S')}] Due tasks found: {len(due_tasks)}"
        )

        if len(due_tasks) == 0:
            # Helpful debug: show the next upcoming task end time (local)
            next_by_deadline = (
                Task.objects
                .filter(completed=False, deadline__isnull=False, deadline__gt=now)
                .select_related('user')
                .order_by('deadline')
                .first()
            )

            if next_by_deadline:
                next_local = timezone.localtime(next_by_deadline.deadline, pk_tz)
                remaining = next_by_deadline.deadline - now
                mins = int(remaining.total_seconds() // 60)
                self.stdout.write(
                    f"   Next task (by deadline): id={next_by_deadline.id}, title='{next_by_deadline.title}', ends_at_local={next_local.strftime('%Y-%m-%d %H:%M:%S')} (in ~{mins} min)"
                )
            else:
                next_by_slot = (
                    Task.objects
                    .filter(completed=False, deadline__isnull=True, task_date__isnull=False, end_time__isnull=False)
                    .select_related('user')
                    .order_by('task_date', 'end_time')
                    .first()
                )

                if next_by_slot:
                    naive_end = datetime.combine(next_by_slot.task_date, next_by_slot.end_time)
                    aware_end = timezone.make_aware(naive_end, pk_tz)
                    end_local = timezone.localtime(aware_end, pk_tz)
                    remaining = aware_end - now
                    mins = int(remaining.total_seconds() // 60)
                    self.stdout.write(
                        f"   Next task (by slot): id={next_by_slot.id}, title='{next_by_slot.title}', ends_at_local={end_local.strftime('%Y-%m-%d %H:%M:%S')} (in ~{mins} min)"
                    )
                else:
                    self.stdout.write('   No upcoming tasks found')

        updated = 0
        for task in due_tasks:
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        f"[DRY-RUN] Would auto-complete Task(id={task.id}, title='{task.title}', user='{task.user.email}')"
                    )
                )
                updated += 1
                continue

            task.completed = True
            task.save(update_fields=['completed', 'updated_at'])

            updated += 1
            local_deadline = timezone.localtime(task.deadline, pk_tz) if task.deadline else None
            self.stdout.write(
                self.style.SUCCESS(
                    f"AUTO-COMPLETED: Task(id={task.id}, title='{task.title}', user='{task.user.email}', end_at_local={(local_deadline.strftime('%Y-%m-%d %H:%M:%S') if local_deadline else str(task.end_time))})"
                )
            )

        return updated

    def handle(self, *args, **options):
        interval_seconds = options['interval_seconds']
        once = options['once']
        dry_run = options['dry_run']

        if once:
            total = self._run_once(dry_run=dry_run)
            if total == 0:
                self.stdout.write(self.style.WARNING('No tasks to auto-complete'))
            return

        self.stdout.write(self.style.SUCCESS('Auto-complete worker started'))
        self.stdout.write(self.style.SUCCESS(f'Polling interval: {interval_seconds}s'))
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN enabled: DB will not be updated'))

        while True:
            try:
                total = self._run_once(dry_run=dry_run)
                sleep(interval_seconds)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING('Auto-complete worker stopped'))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Auto-complete worker error: {e}'))
                sleep(interval_seconds)
