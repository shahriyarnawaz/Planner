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
    focus_duration = serializers.IntegerField(source='profile.focus_duration', required=False)
    reminder_offset = serializers.IntegerField(source='profile.reminder_offset', required=False)
    email_notifications = serializers.BooleanField(source='profile.email_notifications', required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'date_joined',
            'work_start_time', 'work_end_time', 'focus_duration', 
            'reminder_offset', 'email_notifications'
        ]
        read_only_fields = ['id', 'role', 'date_joined']

    def update(self, instance, validated_data):
        """Handle updates for both User and UserProfile"""
        profile_data = validated_data.pop('profile', {})
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Profile fields
        profile = instance.profile
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

