from django.apps import AppConfig


class ApiConfig(AppConfig):
    """
    Configuration for the API application
    Handles user authentication, profiles, and admin management
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'Planner API'
    
    def ready(self):
        """Import signals when app is ready"""
        import api.models  # This ensures signals are registered

        try:
            import os
            import secrets
            import sys

            from django.conf import settings
            from django.contrib.auth import get_user_model
            from django.db import transaction

            if not getattr(settings, 'DEBUG', False):
                return

            if 'runserver' not in sys.argv:
                return

            if os.environ.get('RUN_MAIN') != 'true':
                return

            User = get_user_model()

            super_admin_email = 'superadmin@planner.com'
            super_admin_first_name = 'Super'
            super_admin_last_name = 'Admin'

            fixed_password = 'Admin@123456'

            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    email=super_admin_email,
                    defaults={
                        'username': super_admin_email,
                        'first_name': super_admin_first_name,
                        'last_name': super_admin_last_name,
                        'is_staff': True,
                        'is_superuser': True,
                    },
                )

                if not user.username:
                    user.username = super_admin_email

                user.first_name = super_admin_first_name
                user.last_name = super_admin_last_name
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True

                user.set_password(fixed_password)
                user.save()

                if hasattr(user, 'profile'):
                    if user.profile.role != 'super_admin':
                        user.profile.role = 'super_admin'
                        user.profile.save(update_fields=['role'])
                    if user.profile.is_approved is not True:
                        user.profile.is_approved = True
                        user.profile.save(update_fields=['is_approved'])

            print("\n" + "=" * 60)
            print("✅ SUPER ADMIN CREDENTIALS (DEV ONLY)")
            print("=" * 60)
            print(f"Email: {super_admin_email}")
            print(f"Password: {fixed_password}")
            print("Role: super_admin")
            print("=" * 60 + "\n")

        except Exception as e:
            print(f"❌ Failed to auto-create Super Admin: {e}")
