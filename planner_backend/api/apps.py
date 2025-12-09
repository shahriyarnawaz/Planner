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
