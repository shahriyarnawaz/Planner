from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    
    def save(self, *args, **kwargs):
        """Override save to set deadline from slots and run validation"""
        from datetime import datetime, timezone as dt_timezone
        # Always set deadline from slots
        if self.task_date and self.end_time:
            self.deadline = datetime.combine(self.task_date, self.end_time).replace(tzinfo=dt_timezone.utc)
        self.clean()
        super().save(*args, **kwargs)
