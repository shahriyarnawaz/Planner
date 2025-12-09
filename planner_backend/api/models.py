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
