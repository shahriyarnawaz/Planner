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
    work_start_time = serializers.TimeField(source='profile.work_start_time', required=False)
    work_end_time = serializers.TimeField(source='profile.work_end_time', required=False)
    focus_block_minutes = serializers.IntegerField(source='profile.focus_block_minutes', required=False, min_value=15, max_value=240)
    preferred_reminder_minutes = serializers.IntegerField(source='profile.preferred_reminder_minutes', required=False, min_value=0, max_value=1440)
    email_notifications_enabled = serializers.BooleanField(source='profile.email_notifications_enabled', required=False)
    push_notifications_enabled = serializers.BooleanField(source='profile.push_notifications_enabled', required=False)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'date_joined',
            'work_start_time',
            'work_end_time',
            'focus_block_minutes',
            'preferred_reminder_minutes',
            'email_notifications_enabled',
            'push_notifications_enabled',
        ]
        read_only_fields = ['id', 'role', 'date_joined']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile = getattr(instance, 'profile', None)
        if profile:
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users
    Minimal information for user lists
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

