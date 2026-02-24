from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from zoneinfo import ZoneInfo


class UserProfile(models.Model):
    """
    Extended user profile with role-based access control
    Roles: super_admin, user (ONLY 2 ROLES)
    """
    
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('user', 'User'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.email} - {self.role}"
    
    @property
    def is_super_admin(self):
        """Check if user is super admin"""
        return self.role == 'super_admin'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a User is created
    Default role is 'user'
    """
    if created:
        UserProfile.objects.create(user=instance, role='user')


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile whenever User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class Task(models.Model):
    """
    Task model for the planner application
    Each user can create and manage their own tasks
    """
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    CATEGORY_CHOICES = [
        ('study', 'Study'),
        ('work', 'Work'),
        ('health', 'Health'),
        ('personal', 'Personal'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    
    # Time scheduling
    task_date = models.DateField(blank=True, null=True, help_text='Date for the task')
    start_time = models.TimeField(blank=True, null=True, help_text='Task start time')
    end_time = models.TimeField(blank=True, null=True, help_text='Task end time')
    
    deadline = models.DateTimeField(blank=True, null=True)
    duration = models.IntegerField(help_text='Duration in minutes', blank=True, null=True)
    completed = models.BooleanField(default=False)
    
    # Email tracking
    creation_email_sent = models.BooleanField(default=False)
    completion_email_sent = models.BooleanField(default=False)
    reminder_email_sent = models.BooleanField(default=False)
    reminder_email_sent_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if self.deadline and not self.completed:
            from django.utils import timezone
            return timezone.now() > self.deadline
        return False
    
    @property
    def calculated_duration(self):
        """Calculate duration from start and end time"""
        if self.start_time and self.end_time:
            from datetime import datetime, timedelta
            start = datetime.combine(datetime.today(), self.start_time)
            end = datetime.combine(datetime.today(), self.end_time)
            
            if end < start:
                # Handle overnight tasks
                end += timedelta(days=1)
            
            diff = end - start
            return int(diff.total_seconds() / 60)  # Return minutes
        return self.duration
    
    def clean(self):
        """Validate task data"""
        from django.core.exceptions import ValidationError
        from datetime import datetime, timedelta
        from django.utils import timezone
        pk_tz = ZoneInfo('Asia/Karachi')
        
        # Validate time slot
        if self.start_time and self.end_time:
            start = datetime.combine(datetime.today(), self.start_time)
            end = datetime.combine(datetime.today(), self.end_time)
            
            if end < start:
                end += timedelta(days=1)
            
            duration_minutes = int((end - start).total_seconds() / 60)
            
            if duration_minutes < 15:
                raise ValidationError({
                    'end_time': 'Task duration must be at least 15 minutes'
                })
            
            # Auto-calculate duration
            self.duration = duration_minutes
        
        elif self.start_time or self.end_time:
            raise ValidationError('Both start_time and end_time must be provided together')

        if self.pk is None and not self.completed and self.task_date and self.start_time:
            now_local = timezone.localtime(timezone.now(), pk_tz)
            today = now_local.date()
            current_time = now_local.time()
            if self.task_date < today:
                raise ValidationError({'task_date': 'Task date cannot be in the past'})
            if self.task_date == today and self.start_time <= current_time:
                raise ValidationError({'start_time': 'Task start time must be in the future'})
    
    def save(self, *args, **kwargs):
        """Override save to set deadline from slots and run validation"""
        from datetime import datetime
        from django.utils import timezone
        from api.email_notifications import send_task_completion_email
        pk_tz = ZoneInfo('Asia/Karachi')

        previous_completed = None
        previous_completion_email_sent = None
        if self.pk:
            previous_state = Task.objects.filter(pk=self.pk).values('completed', 'completion_email_sent').first()
            if previous_state:
                previous_completed = previous_state['completed']
                previous_completion_email_sent = previous_state['completion_email_sent']

        # Always set deadline from slots
        if self.task_date and self.end_time:
            naive_deadline = datetime.combine(self.task_date, self.end_time)
            self.deadline = timezone.make_aware(naive_deadline, pk_tz)
        self.clean()
        super().save(*args, **kwargs)

        if (previous_completed is False and self.completed is True and not self.completion_email_sent and not previous_completion_email_sent):
            try:
                send_task_completion_email(self)
            except Exception as e:
                print(f"❌ Failed to send completion email for Task(id={self.id}): {e}")

        if self.completed:
            TaskReminder.objects.filter(task=self, sent_at__isnull=True).delete()
            return

        if self.deadline:
            self.schedule_reminders()

    def schedule_reminders(self, min_gap_minutes=1):
        from datetime import timedelta
        from django.utils import timezone
        from django.conf import settings
        pk_tz = ZoneInfo('Asia/Karachi')

        if not self.task_date or not self.start_time or not self.created_at:
            return

        now = timezone.now()
        min_allowed = self.created_at + timedelta(minutes=min_gap_minutes)

        naive_start = timezone.datetime.combine(self.task_date, self.start_time)
        start_at = timezone.make_aware(naive_start, pk_tz)

        TaskReminder.objects.filter(task=self, sent_at__isnull=True).delete()

        candidates = [
            (TaskReminder.TYPE_DAY_BEFORE, start_at - timedelta(days=1)),
            (TaskReminder.TYPE_HOUR_BEFORE, start_at - timedelta(hours=1)),
            (TaskReminder.TYPE_MINUTES_15, start_at - timedelta(minutes=15)),
        ]

        reminders_to_create = []
        for reminder_type, scheduled_for in candidates:
            if scheduled_for <= now:
                if getattr(settings, 'DEBUG', False):
                    print(f"REMINDER SKIP (past): Task(id={self.id}), type={reminder_type}, scheduled_for={scheduled_for}")
                continue
            if scheduled_for < min_allowed:
                if getattr(settings, 'DEBUG', False):
                    print(f"REMINDER SKIP (too-soon-after-create): Task(id={self.id}), type={reminder_type}, scheduled_for={scheduled_for}, min_allowed={min_allowed}")
                continue
            reminders_to_create.append(TaskReminder(task=self, reminder_type=reminder_type, scheduled_for=scheduled_for))

        if reminders_to_create:
            TaskReminder.objects.bulk_create(reminders_to_create)
            if getattr(settings, 'DEBUG', False):
                print(f"REMINDER SCHEDULED: Task(id={self.id}) created {len(reminders_to_create)} reminder(s)")
        else:
            if getattr(settings, 'DEBUG', False):
                print(f"REMINDER SCHEDULED: Task(id={self.id}) created 0 reminder(s)")


class TaskReminder(models.Model):
    TYPE_DAY_BEFORE = 'day_before'
    TYPE_HOUR_BEFORE = 'hour_before'
    TYPE_MINUTES_15 = 'minutes_15'

    TYPE_CHOICES = [
        (TYPE_DAY_BEFORE, '1 day before'),
        (TYPE_HOUR_BEFORE, '1 hour before'),
        (TYPE_MINUTES_15, '15 minutes before'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_for = models.DateTimeField()
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_reminders'
        constraints = [
            models.UniqueConstraint(
                fields=['task', 'reminder_type'],
                condition=models.Q(sent_at__isnull=True),
                name='uniq_unsent_task_reminder_type',
            ),
        ]

    def __str__(self):
        return f"{self.task_id} - {self.reminder_type} - {self.scheduled_for}"


class TemplateCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='template_categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'template_categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class TaskTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_templates')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task_templates'
        ordering = ['-created_at']
        verbose_name = 'Task Template'
        verbose_name_plural = 'Task Templates'

    def __str__(self):
        return f"{self.name} - {self.user.email}"


class TaskTemplateItem(models.Model):
    template = models.ForeignKey(TaskTemplate, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=Task.PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=20, choices=Task.CATEGORY_CHOICES, default='other')
    task_date = models.DateField(blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task_template_items'
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.template_id} - {self.title}"
