import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'planner_backend.settings')

app = Celery('planner_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Optional safety net: not the primary scheduling mechanism (see api.services.task_schedule).
app.conf.beat_schedule = {
    'reconcile-missed-task-events': {
        'task': 'api.reconcile_missed_task_events',
        'schedule': crontab(minute='*/20'),
    },
}

#
# Deployment (concise checklist):
# - Redis: enable AOF or RDB persistence; tune maxmemory-policy for broker-only usage.
# - Match CELERY_VISIBILITY_TIMEOUT (settings) to your longest ETA from "now" (defaults to 5 days).
# - Workers: celery -A planner_backend worker -Q mail,tasks,maintenance,default -l INFO --concurrency=N
# - Beat (optional reconcile only): celery -A planner_backend beat -l INFO
# - Monitoring: Flower (CLI above), Prometheus celery exporter, or Sentry (SENTRY_DSN).
# - Scheduled ETA messages live in Redis until due; Redis restart can lose queued work — rely on reconcile Beat + Idempotency.
#
