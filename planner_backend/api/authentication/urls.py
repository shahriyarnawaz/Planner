"""
Authentication URL Configuration
All authentication-related endpoints
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ChangePasswordView,
    ForgotPasswordView,
)

urlpatterns = [
    # User Registration and Login
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    
    # Token Management
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password Management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
]

