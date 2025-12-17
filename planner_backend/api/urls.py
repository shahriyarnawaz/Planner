"""
Main API URL Router
Routes to different API modules (authentication, users, admin, tasks, ml, etc.)
"""

from django.urls import path, include

from api.tasks.views import WeeklyTrendsView

urlpatterns = [
    # Authentication Module
    # Handles: register, login, logout, token refresh, password management
    path('auth/', include('api.authentication.urls')),
    
    # User Management Module
    # Handles: user profile, user listing, user details
    path('users/', include('api.users.urls')),
    
    # Admin Management Module (Super Admin Only)
    # Handles: create admin, manage roles, user statistics
    path('admin/', include('api.admin_management.urls')),
    
    # Tasks Module
    # Handles: task CRUD operations, task statistics
    path('tasks/', include('api.tasks.urls')),

    # Templates Module
    path('', include('api.templates.urls')),

    # Analytics Module
    path('analytics/weekly-trends', WeeklyTrendsView.as_view(), name='analytics-weekly-trends'),
    
    # ML Module (Smart Features)
    # Handles: recurring tasks, time predictions, task ordering, insights
    path('ml/', include('api.ml.urls')),
]

