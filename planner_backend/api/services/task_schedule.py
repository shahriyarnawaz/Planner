"""
Event-driven Celery ETA scheduling for task reminders and end-time completion.

Redis is only the broker; Celery handles ETA. No polling here.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from celery import current_app
from django.apps import apps
from django.conf import settings as django_settings
from django.utils import timezone
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

PK_TZ = ZoneInfo('Asia/Karachi')


def _revoke_celery_id(celery_task_id: str | None) -> None:
    if not celery_task_id:
        return
    try:
        current_app.control.revoke(celery_task_id, terminate=False)
    except Exception as exc:
        logger.warning('Failed to revoke Celery task id=%s: %s', celery_task_id, exc)


def revoke_task_notification_jobs_for_instance(task) -> None:
    """Revoke scheduled jobs using IDs stored on the task instance (e.g. pre_delete)."""
    _revoke_celery_id(task.reminder_task_id)
    _revoke_celery_id(task.completion_task_id)


def _clear_stored_job_ids(task_id: int) -> None:
    Task = apps.get_model('api', 'Task')
    Task.objects.filter(pk=task_id).update(reminder_task_id=None, completion_task_id=None)


def effective_reminder_minutes(task) -> int:
    if task.reminder_minutes is not None:
        return int(task.reminder_minutes)
    user = task.user
    if hasattr(user, 'profile'):
        return int(user.profile.preferred_reminder_minutes)
    return 15


def _completion_eta(task):
    """Use stored deadline (already timezone-aware in Asia/Karachi)."""
    return task.deadline


def _start_at(task):
    if not (task.task_date and task.start_time):
        return None
    naive = datetime.combine(task.task_date, task.start_time)
    return timezone.make_aware(naive, PK_TZ)


def _email_reminders_enabled(task) -> bool:
    profile = getattr(task.user, 'profile', None)
    if profile is None:
        return True
    return bool(profile.email_notifications_enabled)


def sync_task_notification_jobs(task_id: int, *, revoke_only: bool = False) -> None:
    """
    Revoke prior ETA jobs, then schedule reminder + completion using apply_async(eta=...).

    Uses QuerySet.update for Celery IDs so this never re-enters Task.save().
    """
    Task = apps.get_model('api', 'Task')

    try:
        task = Task.objects.select_related('user', 'user__profile').get(pk=task_id)
    except Task.DoesNotExist:
        return

    mail_q = getattr(django_settings, 'CELERY_MAIL_QUEUE', 'mail')
    tasks_q = getattr(django_settings, 'CELERY_TASKS_QUEUE', 'tasks')

    _revoke_celery_id(task.reminder_task_id)
    _revoke_celery_id(task.completion_task_id)
    _clear_stored_job_ids(task_id)

    if revoke_only or task.completed:
        logger.info(
            'task_schedule_skip',
            extra={'task_id': task_id, 'reason': 'revoke_only_or_completed'},
        )
        return

    if not (task.task_date and task.start_time and task.end_time and task.deadline):
        logger.info(
            'task_schedule_skip',
            extra={'task_id': task_id, 'reason': 'incomplete_slot_or_deadline'},
        )
        return

    now = timezone.now()
    start_at = _start_at(task)
    if start_at is None:
        return

    reminder_minutes = effective_reminder_minutes(task)
    reminder_eta = start_at - timedelta(minutes=reminder_minutes)
    completion_eta = _completion_eta(task)

    from api import celery_tasks as celery_task_module

    new_reminder_id = None
    new_completion_id = None

    if reminder_eta > now and not task.reminder_email_sent and _email_reminders_enabled(task):
        async_result = celery_task_module.send_task_reminder_job.apply_async(
            args=[task_id],
            eta=reminder_eta,
            queue=mail_q,
        )
        new_reminder_id = async_result.id
        logger.info(
            'task_schedule_reminder_eta',
            extra={
                'task_id': task_id,
                'eta': reminder_eta.isoformat(),
                'celery_id': new_reminder_id,
                'queue': mail_q,
            },
        )
    elif reminder_eta <= now and not task.reminder_email_sent:
        logger.info(
            'task_schedule_reminder_skipped_past',
            extra={'task_id': task_id, 'reminder_eta': reminder_eta.isoformat(), 'now': now.isoformat()},
        )

    if completion_eta is not None:
        if completion_eta > now and not task.completed:
            async_result = celery_task_module.complete_task_at_end_job.apply_async(
                args=[task_id],
                eta=completion_eta,
                queue=tasks_q,
            )
            new_completion_id = async_result.id
            logger.info(
                'task_schedule_completion_eta',
                extra={
                    'task_id': task_id,
                    'eta': completion_eta.isoformat(),
                    'celery_id': new_completion_id,
                    'queue': tasks_q,
                },
            )
        elif completion_eta <= now and not task.completed:
            async_result = celery_task_module.complete_task_at_end_job.apply_async(
                args=[task_id],
                countdown=0,
                queue=tasks_q,
            )
            new_completion_id = async_result.id
            logger.info(
                'task_schedule_completion_asap',
                extra={'task_id': task_id, 'celery_id': new_completion_id, 'queue': tasks_q},
            )

    Task.objects.filter(pk=task_id).update(
        reminder_task_id=new_reminder_id,
        completion_task_id=new_completion_id,
    )
