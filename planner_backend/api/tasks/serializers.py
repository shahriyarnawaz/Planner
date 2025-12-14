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
    calculated_duration = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id',
            'user_email',
            'title',
            'description',
            'priority',
            'category',
            'task_date',
            'start_time',
            'end_time',
            'deadline',
            'duration',
            'calculated_duration',
            'completed',
            'is_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_email', 'is_overdue', 'calculated_duration', 'created_at', 'updated_at']
    
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
    Serializer for creating tasks with compulsory slots and auto deadline
    """
    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'priority',
            'category',
            'task_date',
            'start_time',
            'end_time',
            'duration',
        ]
    
    def validate(self, attrs):
        from datetime import datetime, timezone as dt_timezone
        # Require all slots
        task_date = attrs.get('task_date')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if not (task_date and start_time and end_time):
            raise serializers.ValidationError({
                'slot': 'task_date, start_time, and end_time are all required.'
            })
        # Validate min duration (15 min)
        dt_start = datetime.combine(task_date, start_time)
        dt_end = datetime.combine(task_date, end_time)
        if dt_end < dt_start:
            dt_end = dt_end.replace(day=dt_end.day + 1)  # Support overnight
        minutes = int((dt_end - dt_start).total_seconds() / 60)
        if minutes < 15:
            raise serializers.ValidationError({
                'slot': 'Task duration must be at least 15 minutes.'
            })
        attrs['duration'] = minutes
        # Set deadline (always as UTC)
        attrs['deadline'] = datetime.combine(task_date, end_time).replace(tzinfo=dt_timezone.utc)
        return attrs


class TaskUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating tasks - all fields are optional, but all slots must be present to update slot.
    """
    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'priority',
            'category',
            'task_date',
            'start_time',
            'end_time',
            'duration',
            'completed',
        ]
    def validate(self, attrs):
        from datetime import datetime, timezone as dt_timezone
        # Only require slots if changing any slot
        slot_changes = any(k in attrs for k in ['task_date','start_time','end_time'])
        if slot_changes:
            task_date = attrs.get('task_date') or self.instance.task_date
            start_time = attrs.get('start_time') or self.instance.start_time
            end_time = attrs.get('end_time') or self.instance.end_time
            if not (task_date and start_time and end_time):
                raise serializers.ValidationError({
                    'slot': 'task_date, start_time, and end_time are all required to update.'
                })
            dt_start = datetime.combine(task_date, start_time)
            dt_end = datetime.combine(task_date, end_time)
            if dt_end < dt_start:
                dt_end = dt_end.replace(day=dt_end.day + 1)
            minutes = int((dt_end - dt_start).total_seconds() / 60)
            if minutes < 15:
                raise serializers.ValidationError({
                    'slot': 'Task duration must be at least 15 minutes.'
                })
            attrs['duration'] = minutes
            attrs['deadline'] = datetime.combine(task_date, end_time).replace(tzinfo=dt_timezone.utc)
        return attrs


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

