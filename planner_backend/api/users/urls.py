"""
Users URL Configuration
All user management related endpoints
"""

from django.urls import path
from .views import (
    UserProfileView,
    UserListView,
    UserDetailView,
)

urlpatterns = [
    # User Profile Management
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # User Listing and Details
    path('list/', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]

