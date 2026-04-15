"""
ML Views
Smart recommendations and insights for task management
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Task, MLModelConfig, MLInferenceLog, MLErrorLog
from .algorithms import TaskAnalyzer
from datetime import timedelta
from django.utils import timezone
import json

def track_inference(model_name, user, inputs, output, confidence):
    """Helper to track ML inferences safely without breaking the main flow"""
    try:
        config, _ = MLModelConfig.objects.get_or_create(
            name=model_name, 
            defaults={'version': 'v1.0', 'status': 'healthy'}
        )
        if config.status == 'offline':
            return
            
        MLInferenceLog.objects.create(
            model_config=config,
            user=user,
            input_data=json.dumps(inputs) if isinstance(inputs, dict) else str(inputs),
            output_data=json.dumps(output) if isinstance(output, (dict, list)) else str(output),
            confidence_score=confidence
        )
    except Exception as e:
        try:
            config = MLModelConfig.objects.get(name=model_name)
            MLErrorLog.objects.create(model_config=config, error_message=str(e))
        except:
            pass

class MakeRecurringView(APIView):
    """
    Rapidly make a task recurring by scheduling it for the next 7 days.
    
    POST /api/ml/make-recurring/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        title = request.data.get('title')
        category = request.data.get('category', 'other')
        
        # 'avg_duration' may come as null or zero if not numeric
        try:
            duration = int(request.data.get('avg_duration') or 0)
            if duration <= 0:
                duration = None
        except (ValueError, TypeError):
            duration = None
            
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
            
        if not title:
            return Response({'error': 'Task title is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        now = timezone.now()
        
        # Notice: Not using bulk_create because we want the Task model's .save() 
        # to trigger the reminder logic properly.
        for i in range(1, 8):
            target_date = (now + timedelta(days=i)).date()
            task = Task(
                user=user,
                title=title,
                category=category,
                task_date=target_date,
                priority='medium',
                start_time=start_time,
                end_time=end_time
            )
            if duration and not (start_time and end_time):
                task.duration = duration
            task.save()
            
        return Response({
            'message': f'Successfully made "{title}" a recurring task for the next 7 days!'
        }, status=status.HTTP_201_CREATED)


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
        try:
            recurring_tasks = analyzer.detect_recurring_tasks(all_tasks)
            best_times = analyzer.predict_best_time(all_tasks)
            task_order = analyzer.suggest_task_order(pending_tasks)
            insights = analyzer.get_task_insights(all_tasks)
            
            # Log these inferences behind the scenes
            track_inference(
                'Recurring Task Detection', 
                user, 
                f"{len(all_tasks)} historical tasks", 
                f"Detected {len(recurring_tasks)} patterns", 
                confidence=0.85
            )
            
            track_inference(
                'Best Time Prediction', 
                user, 
                "User Task History", 
                best_times, 
                confidence=0.92
            )
            
            track_inference(
                'Task Recommendations', 
                user, 
                f"{len(pending_tasks)} pending tasks", 
                f"Generated custom sorting order", 
                confidence=0.78
            )

        except Exception as e:
            # Trapping any generic engine failures into MLErrorLog
            track_inference('Task Recommendations', user, "Exception", {"error": str(e)}, 0.0)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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

