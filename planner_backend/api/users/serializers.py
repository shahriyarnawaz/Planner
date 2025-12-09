"""
User Profile Serializers
Handles serialization for user profile information and management
"""

from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    Used for displaying and updating user details
    """
    role = serializers.CharField(source='profile.role', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'date_joined']
        read_only_fields = ['id', 'role', 'date_joined']


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users
    Minimal information for user lists
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

