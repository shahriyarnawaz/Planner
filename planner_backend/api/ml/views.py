"""
ML Views
Smart recommendations and insights for task management
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Task
from .algorithms import TaskAnalyzer


class MLRecommendationsView(APIView):
    """
    Get personalized ML-powered recommendations
    
    GET /api/ml/recommendations/
    
    Returns:
        - Recurring task detection
        - Best time predictions
        - Task ordering suggestions
        - General insights
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get user's tasks
        all_tasks = Task.objects.filter(user=user).order_by('-created_at')
        pending_tasks = all_tasks.filter(completed=False)
        
        if not all_tasks.exists():
            return Response({
                'message': 'No task history available. Create some tasks to get personalized recommendations!',
                'recommendations': None
            }, status=status.HTTP_200_OK)
        
        # Initialize analyzer
        analyzer = TaskAnalyzer(user)
        
        # Get recommendations
        recurring_tasks = analyzer.detect_recurring_tasks(all_tasks)
        best_times = analyzer.predict_best_time(all_tasks)
        task_order = analyzer.suggest_task_order(pending_tasks)
        insights = analyzer.get_task_insights(all_tasks)
        
        return Response({
            'recommendations': {
                'recurring_tasks': {
                    'description': 'Tasks that appear to repeat regularly',
                    'count': len(recurring_tasks),
                    'tasks': recurring_tasks
                },
                'best_time_predictions': {
                    'description': 'Best times to complete tasks based on your history',
                    'predictions': best_times
                },
                'suggested_task_order': {
                    'description': 'Recommended order to complete pending tasks',
                    'count': len(task_order),
                    'tasks': task_order[:10]  # Top 10
                },
                'insights': {
                    'description': 'Your overall task patterns and productivity',
                    'data': insights
                }
            }
        }, status=status.HTTP_200_OK)


class RecurringTasksView(APIView):
    """
    Get only recurring tasks detection
    
    GET /api/ml/recurring-tasks/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user).order_by('-created_at')
        
        analyzer = TaskAnalyzer(user)
        recurring = analyzer.detect_recurring_tasks(tasks)
        
        return Response({
            'recurring_tasks': recurring,
            'count': len(recurring),
            'message': f'Found {len(recurring)} recurring task pattern(s)'
        }, status=status.HTTP_200_OK)


class BestTimeView(APIView):
    """
    Get best time predictions for different categories
    
    GET /api/ml/best-time/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        
        analyzer = TaskAnalyzer(user)
        best_times = analyzer.predict_best_time(tasks)
        
        return Response({
            'best_times': best_times,
            'message': 'Best time predictions based on your completion history'
        }, status=status.HTTP_200_OK)


class TaskOrderView(APIView):
    """
    Get suggested task order for pending tasks
    
    GET /api/ml/task-order/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        pending_tasks = Task.objects.filter(user=user, completed=False)
        
        analyzer = TaskAnalyzer(user)
        ordered_tasks = analyzer.suggest_task_order(pending_tasks)
        
        return Response({
            'suggested_order': ordered_tasks,
            'count': len(ordered_tasks),
            'message': 'Tasks ordered by priority, deadline, and other factors'
        }, status=status.HTTP_200_OK)


class InsightsView(APIView):
    """
    Get productivity insights
    
    GET /api/ml/insights/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        
        analyzer = TaskAnalyzer(user)
        insights = analyzer.get_task_insights(tasks)
        
        return Response({
            'insights': insights,
            'message': 'Your productivity insights and task patterns'
        }, status=status.HTTP_200_OK)

