"""
Celery tasks for ETA-driven reminders and auto-completion.

Imported from ApiConfig.ready so shared_task registrations load with Django.

Production notes:
- Uses select_for_update to reduce duplicate sends under concurrency.
- Retries use exponential backoff (cap 1 hour).
- Redis broker: set CELERY_BROKER_TRANSPORT_OPTIONS visibility_timeout longer than max ETA (settings).
"""

from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.apps import apps
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from api.services.task_schedule import PK_TZ, effective_reminder_minutes, _start_at

logger = logging.getLogger(__name__)

MAX_EMAIL_RETRIES = 5


def _retry_delay(request_retries: int) -> int:
    """Exponential backoff in seconds, capped at 1 hour."""
    return min(3600, int(30 * (2 ** request_retries)))


@shared_task(
    bind=True,
    ignore_result=True,
    name='api.send_task_reminder_job',
    max_retries=MAX_EMAIL_RETRIES,
)
def send_task_reminder_job(self, task_id: int) -> None:
    Task = apps.get_model('api', 'Task')
    celery_rid = getattr(self.request, 'id', None)
    logger.info(
        'reminder_job_started',
        extra={'task_id': task_id, 'celery_task_id': celery_rid, 'retries': self.request.retries},
    )

    try:
        with transaction.atomic():
            locked = (
                Task.objects.select_for_update()
                .select_related('user', 'user__profile')
                .filter(pk=task_id)
                .first()
            )
            if locked is None:
                logger.info(
                    'reminder_job_skip_missing',
                    extra={'task_id': task_id, 'reason': 'deleted_or_locked'},
                )
                return

            if locked.completed or locked.reminder_email_sent:
                logger.info(
                    'reminder_job_skip_idempotent',
                    extra={'task_id': task_id, 'completed': locked.completed, 'reminder_sent': locked.reminder_email_sent},
                )
                return

            profile = getattr(locked.user, 'profile', None)
            if profile is not None and not profile.email_notifications_enabled:
                logger.info('reminder_job_skip_notifications_disabled', extra={'task_id': task_id})
                return

            from api.email_notifications import send_task_reminder_email

            send_task_reminder_email(
                locked,
                reminder_type=None,
                scheduled_for=None,
                raise_on_failure=True,
            )

    except Exception as exc:
        logger.warning(
            'reminder_job_failed',
            extra={'task_id': task_id, 'celery_task_id': celery_rid, 'retries': self.request.retries},
            exc_info=True,
        )
        raise self.retry(exc=exc, countdown=_retry_delay(self.request.retries))

    logger.info('reminder_job_finished', extra={'task_id': task_id, 'celery_task_id': celery_rid})


@shared_task(
    bind=True,
    ignore_result=True,
    name='api.complete_task_at_end_job',
    max_retries=MAX_EMAIL_RETRIES,
)
def complete_task_at_end_job(self, task_id: int) -> None:
    Task = apps.get_model('api', 'Task')
    celery_rid = getattr(self.request, 'id', None)
    logger.info(
        'completion_job_started',
        extra={'task_id': task_id, 'celery_task_id': celery_rid, 'retries': self.request.retries},
    )

    from api.email_notifications import send_task_completion_email

    try:
        task = Task.objects.select_related('user', 'user__profile').get(pk=task_id)
    except Task.DoesNotExist:
        logger.info('completion_job_task_missing', extra={'task_id': task_id})
        return

    profile = getattr(task.user, 'profile', None)
    email_ok = profile is None or profile.email_notifications_enabled

    # Outstanding completion email for an already-completed task (SMTP failed earlier / worker crash).
    if task.completed and email_ok and not task.completion_email_sent:
        try:
            send_task_completion_email(task, raise_on_failure=True)
            logger.info('completion_email_delivered_retry_path', extra={'task_id': task_id})
        except Exception as exc:
            logger.warning(
                'completion_email_failed_retry_path',
                extra={'task_id': task_id},
                exc_info=True,
            )
            raise self.retry(exc=exc, countdown=_retry_delay(self.request.retries))
        return

    if task.completed:
        logger.info('completion_job_skip_already_done', extra={'task_id': task_id})
        return

    try:
        with transaction.atomic():
            locked = (
                Task.objects.select_for_update()
                .select_related('user', 'user__profile')
                .filter(pk=task_id)
                .first()
            )
            if locked is None:
                return
            if locked.completed:
                return

            inner_profile = getattr(locked.user, 'profile', None)
            inner_email_ok = inner_profile is None or inner_profile.email_notifications_enabled

            if inner_email_ok:
                locked.completed = True
                locked.save(update_fields=['completed', 'updated_at'])
            else:
                Task.objects.filter(pk=task_id, completed=False).update(
                    completed=True,
                    updated_at=timezone.now(),
                )
    except Exception as exc:
        logger.warning(
            'completion_phase_failed',
            extra={'task_id': task_id},
            exc_info=True,
        )
        raise self.retry(exc=exc, countdown=_retry_delay(self.request.retries))

    task.refresh_from_db()

    # Model save path uses send_task_completion_email(..., raise_on_failure=False); recover hard failures here.
    if email_ok and task.completed and not task.completion_email_sent:
        try:
            send_task_completion_email(task, raise_on_failure=True)
            logger.info('completion_email_delivered_post_save', extra={'task_id': task_id})
        except Exception as exc:
            logger.warning(
                'completion_email_failed_post_save',
                extra={'task_id': task_id},
                exc_info=True,
            )
            raise self.retry(exc=exc, countdown=_retry_delay(self.request.retries))

    logger.info('completion_job_finished', extra={'task_id': task_id, 'celery_task_id': celery_rid})


# Do not retry the sweeper indefinitely — one run is enough; next beat picks up leftovers.
@shared_task(bind=True, ignore_result=True, name='api.reconcile_missed_task_events', max_retries=1)
def reconcile_missed_task_events(self) -> None:
    """
    Secondary safety net (Celery Beat). Bounded lookback for reminders avoids a backlog storm.
    Idempotent: delegates to the same tasks as ETA scheduling.
    """
    Task = apps.get_model('api', 'Task')
    now = timezone.now()
    now_local = timezone.localtime(now, PK_TZ)
    today_local = now_local.date()
    current_time_local = now_local.time()

    lookback = now - timedelta(days=7)

    completion_qs = (
        Task.objects.filter(completed=False)
        .filter(
            Q(deadline__isnull=False, deadline__lte=now)
            | Q(
                deadline__isnull=True,
                task_date__isnull=False,
                end_time__isnull=False,
                task_date__lt=today_local,
            )
            | Q(
                deadline__isnull=True,
                task_date=today_local,
                task_date__isnull=False,
                end_time__isnull=False,
                end_time__lte=current_time_local,
            )
        )
        .distinct()
        .order_by('deadline', 'task_date', 'end_time')
        .values_list('pk', flat=True)[:500]
    )

    mail_q = getattr(settings, 'CELERY_MAIL_QUEUE', 'mail')
    tasks_q = getattr(settings, 'CELERY_TASKS_QUEUE', 'tasks')

    completion_scheduled = 0
    for pk in completion_qs:
        complete_task_at_end_job.apply_async(args=[pk], countdown=0, queue=tasks_q)
        completion_scheduled += 1

    reminder_candidates = (
        Task.objects.filter(
            completed=False,
            reminder_email_sent=False,
            task_date__isnull=False,
            start_time__isnull=False,
        )
        .select_related('user', 'user__profile')
        .order_by('task_date', 'start_time')
    )

    reminder_scheduled = 0
    for task in reminder_candidates.iterator(chunk_size=100):
        profile = getattr(task.user, 'profile', None)
        if profile is not None and not profile.email_notifications_enabled:
            continue
        start_at = _start_at(task)
        if start_at is None:
            continue
        reminder_eta = start_at - timedelta(minutes=effective_reminder_minutes(task))
        # Only reconcile recent windows — ancient tasks stay manual / admin cleanup.
        if reminder_eta > now:
            continue
        if reminder_eta < lookback:
            continue
        send_task_reminder_job.apply_async(args=[task.pk], countdown=0, queue=mail_q)
        reminder_scheduled += 1

    logger.info(
        'reconcile_finished',
        extra={
            'completion_enqueued': completion_scheduled,
            'reminder_enqueued': reminder_scheduled,
            'lookback_days': 7,
        },
    )
