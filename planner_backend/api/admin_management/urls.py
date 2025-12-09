"""
Admin Management URL Configuration
Super Admin only endpoints
"""

from django.urls import path
from .views import (
    CreateUserView,
    ListAllUsersView,
    DeactivateUserView,
    GetUserStatsView,
)

urlpatterns = [
    # User Creation (Super Admin only)
    path('create-user/', CreateUserView.as_view(), name='create-user'),
    
    # User Management
    path('users/', ListAllUsersView.as_view(), name='list-all-users'),
    path('users/<int:user_id>/toggle-status/', DeactivateUserView.as_view(), name='toggle-user-status'),
    
    # Statistics
    path('stats/', GetUserStatsView.as_view(), name='user-stats'),
]

