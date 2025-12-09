"""
Management command to create the hardcoded Super Admin
This should be run only once during initial setup
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile


class Command(BaseCommand):
    help = 'Creates the hardcoded Super Admin account'

    def handle(self, *args, **kwargs):
        # Hardcoded super admin credentials
        SUPER_ADMIN_EMAIL = 'superadmin@planner.com'
        SUPER_ADMIN_PASSWORD = 'SuperAdmin@123'
        SUPER_ADMIN_FIRST_NAME = 'Super'
        SUPER_ADMIN_LAST_NAME = 'Admin'
        
        # Check if super admin already exists
        if User.objects.filter(email=SUPER_ADMIN_EMAIL).exists():
            self.stdout.write(
                self.style.WARNING('Super Admin already exists!')
            )
            user = User.objects.get(email=SUPER_ADMIN_EMAIL)
            
            # Ensure the user has super_admin role
            if hasattr(user, 'profile'):
                if user.profile.role != 'super_admin':
                    user.profile.role = 'super_admin'
                    user.profile.save()
                    self.stdout.write(
                        self.style.SUCCESS('Updated existing user to Super Admin role')
                    )
            else:
                # Create profile if it doesn't exist
                UserProfile.objects.create(user=user, role='super_admin')
                self.stdout.write(
                    self.style.SUCCESS('Created Super Admin profile for existing user')
                )
            
            return
        
        try:
            # Create super admin user
            user = User.objects.create_user(
                username=SUPER_ADMIN_EMAIL,
                email=SUPER_ADMIN_EMAIL,
                password=SUPER_ADMIN_PASSWORD,
                first_name=SUPER_ADMIN_FIRST_NAME,
                last_name=SUPER_ADMIN_LAST_NAME,
                is_staff=True,
                is_superuser=True
            )
            
            # Set role to super_admin
            user.profile.role = 'super_admin'
            user.profile.save()
            
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.SUCCESS('✅ Super Admin created successfully!')
            )
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.SUCCESS(f'Email: {SUPER_ADMIN_EMAIL}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Password: {SUPER_ADMIN_PASSWORD}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Role: super_admin')
            )
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.WARNING('⚠️  IMPORTANT: Change the password after first login!')
            )
            self.stdout.write(
                self.style.WARNING('⚠️  This account can create admin users!')
            )
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating Super Admin: {str(e)}')
            )

