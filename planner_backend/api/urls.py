"""
Main API URL Router
Routes to different API modules (authentication, users, etc.)
"""

from django.urls import path, include

urlpatterns = [
    # Authentication Module
    # Handles: register, login, logout, token refresh, password management
    path('auth/', include('api.authentication.urls')),
    
    # User Management Module
    # Handles: user profile, user listing, user details
    path('users/', include('api.users.urls')),
]

