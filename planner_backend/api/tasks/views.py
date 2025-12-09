"""
Task Views
Handles CRUD operations for tasks
Users can only access their own tasks
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from api.models import Task
from api.permissions import IsOwnerOrSuperAdmin
from .serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    TaskListSerializer,
)


class TaskCreateView(generics.CreateAPIView):
    """
    Create a new task
    
    POST /api/tasks/create/
    
    Request Body:
        - title (string, required)
        - description (string, optional)
        - priority (string, optional): "low", "medium", "high"
        - category (string, optional): "study", "work", "health", "personal", "shopping", "other"
        - deadline (datetime, optional)
        - duration (integer, optional): Duration in minutes
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Automatically assign the task to the logged-in user
        task = serializer.save(user=request.user)
        
        # Return full task data
        response_serializer = TaskSerializer(task)
        
        return Response({
            'task': response_serializer.data,
            'message': 'Task created successfully'
        }, status=status.HTTP_201_CREATED)


class TaskListView(generics.ListAPIView):
    """
    Get all tasks for the authenticated user
    
    GET /api/tasks/
    
    Query Parameters (optional):
        - priority: Filter by priority (low, medium, high)
        - category: Filter by category
        - completed: Filter by completion status (true/false)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskListSerializer

    def get_queryset(self):
        """Return tasks for the authenticated user only"""
        user = self.request.user
        queryset = Task.objects.filter(user=user)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by completed status
        completed = self.request.query_params.get('completed', None)
        if completed is not None:
            is_completed = completed.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(completed=is_completed)
        
        return queryset


class TaskDetailView(generics.RetrieveAPIView):
    """
    Get a specific task by ID
    
    GET /api/tasks/{task_id}/
    
    User can only view their own tasks
    Super admin can view all tasks
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]
    serializer_class = TaskSerializer

    def get_queryset(self):
        """Return tasks for the authenticated user or all if super admin"""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.is_super_admin:
            return Task.objects.all()
        return Task.objects.filter(user=user)


class TaskUpdateView(generics.UpdateAPIView):
    """
    Update a task
    
    PUT/PATCH /api/tasks/{task_id}/update/
    
    Request Body (all optional):
        - title (string)
        - description (string)
        - priority (string)
        - category (string)
        - deadline (datetime)
        - duration (integer)
        - completed (boolean)
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]
    serializer_class = TaskUpdateSerializer

    def get_queryset(self):
        """Return tasks for the authenticated user only"""
        return Task.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full task data
        response_serializer = TaskSerializer(instance)
        
        return Response({
            'task': response_serializer.data,
            'message': 'Task updated successfully'
        }, status=status.HTTP_200_OK)


class TaskDeleteView(generics.DestroyAPIView):
    """
    Delete a task
    
    DELETE /api/tasks/{task_id}/delete/
    
    User can only delete their own tasks
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]

    def get_queryset(self):
        """Return tasks for the authenticated user only"""
        return Task.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        task_title = instance.title
        self.perform_destroy(instance)
        
        return Response({
            'message': f'Task "{task_title}" deleted successfully'
        }, status=status.HTTP_200_OK)


class TaskToggleCompleteView(APIView):
    """
    Toggle task completion status
    
    PATCH /api/tasks/{task_id}/toggle-complete/
    
    Toggles between completed=True and completed=False
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]

    def patch(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        
        # Toggle completion status
        task.completed = not task.completed
        task.save()
        
        response_serializer = TaskSerializer(task)
        
        status_text = "completed" if task.completed else "incomplete"
        
        return Response({
            'task': response_serializer.data,
            'message': f'Task marked as {status_text}'
        }, status=status.HTTP_200_OK)


class TaskStatsView(APIView):
    """
    Get task statistics for the authenticated user
    
    GET /api/tasks/stats/
    
    Returns counts of tasks by status, priority, and category
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        
        total = tasks.count()
        completed = tasks.filter(completed=True).count()
        pending = tasks.filter(completed=False).count()
        
        # Count by priority
        high_priority = tasks.filter(priority='high', completed=False).count()
        medium_priority = tasks.filter(priority='medium', completed=False).count()
        low_priority = tasks.filter(priority='low', completed=False).count()
        
        # Count by category
        category_counts = {}
        for category, _ in Task.CATEGORY_CHOICES:
            count = tasks.filter(category=category).count()
            if count > 0:
                category_counts[category] = count
        
        # Count overdue tasks
        overdue_count = sum(1 for task in tasks.filter(completed=False) if task.is_overdue)
        
        return Response({
            'statistics': {
                'total_tasks': total,
                'completed_tasks': completed,
                'pending_tasks': pending,
                'overdue_tasks': overdue_count,
                'priority': {
                    'high': high_priority,
                    'medium': medium_priority,
                    'low': low_priority,
                },
                'categories': category_counts,
            }
        }, status=status.HTTP_200_OK)

