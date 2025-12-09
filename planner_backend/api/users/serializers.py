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
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users
    Minimal information for user lists
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

