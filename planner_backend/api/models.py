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
    deadline = models.DateTimeField(blank=True, null=True)
    duration = models.IntegerField(help_text='Duration in minutes', blank=True, null=True)
    completed = models.BooleanField(default=False)
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
