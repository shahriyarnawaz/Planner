"""
Task Serializers
Handles serialization for task CRUD operations
"""

from rest_framework import serializers
from api.models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model
    Used for creating and displaying tasks
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'user_email',
            'title',
            'description',
            'priority',
            'category',
            'deadline',
            'duration',
            'completed',
            'is_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_email', 'is_overdue', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()
    
    def validate_duration(self, value):
        """Validate duration is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Duration must be a positive number")
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating tasks
    """
    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'priority',
            'category',
            'deadline',
            'duration',
        ]
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()
    
    def validate_duration(self, value):
        """Validate duration is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Duration must be a positive number")
        return value


class TaskUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating tasks
    All fields are optional
    """
    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'priority',
            'category',
            'deadline',
            'duration',
            'completed',
        ]
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'priority': {'required': False},
            'category': {'required': False},
            'deadline': {'required': False},
            'duration': {'required': False},
            'completed': {'required': False},
        }
    
    def validate_title(self, value):
        """Validate title is not empty if provided"""
        if value is not None and (not value or not value.strip()):
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip() if value else value
    
    def validate_duration(self, value):
        """Validate duration is positive if provided"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Duration must be a positive number")
        return value


class TaskListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing tasks
    """
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'priority',
            'category',
            'deadline',
            'completed',
            'is_overdue',
            'created_at',
        ]

