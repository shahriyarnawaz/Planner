"""
Task Views
Handles CRUD operations for tasks
Users can only access their own tasks
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Case, When, IntegerField

from api.models import Task
from api.permissions import IsOwnerOrSuperAdmin
from api.email_notifications import send_task_creation_email, send_task_completion_email
from .serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    TaskListSerializer,
)


class UpcomingTasksView(APIView):
    """Return all upcoming (future) tasks for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Q

        user = request.user
        now_local = timezone.localtime(timezone.now())
        today = now_local.date()
        current_time = now_local.time()

        queryset = Task.objects.filter(
            user=user,
            completed=False,
            task_date__isnull=False,
            start_time__isnull=False,
        ).filter(
            Q(task_date__gt=today) |
            (Q(task_date=today) & Q(start_time__gt=current_time))
        ).order_by('task_date', 'start_time')

        serializer = TaskSerializer(queryset, many=True)

        return Response({
            'upcoming_tasks': {
                'count': queryset.count(),
                'tasks': serializer.data,
            },
            'message': f'Found {queryset.count()} upcoming task(s)'
        }, status=status.HTTP_200_OK)


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
        
        # Send email notification
        print("\n" + "="*60)
        print("🔄 ATTEMPTING TO SEND TASK CREATION EMAIL...")
        print("="*60)
        
        email_sent = send_task_creation_email(task)
        
        if email_sent:
            print("✅ Email notification sent successfully!")
        else:
            print("⚠️ Email notification failed, but task was created successfully.")
        
        # Return full task data
        response_serializer = TaskSerializer(task)
        
        return Response({
            'task': response_serializer.data,
            'message': 'Task created successfully',
            'email_sent': email_sent
        }, status=status.HTTP_201_CREATED)


class TaskListView(generics.ListAPIView):
    """
    Get all tasks for the authenticated user with advanced search & filters
    
    GET /api/tasks/
    
    Query Parameters (optional):
        - search: Search in title and description
        - priority: Filter by priority (low, medium, high)
        - category: Filter by category
        - completed: Filter by completion status (true/false)
        - date_from: Filter tasks created after this date (YYYY-MM-DD)
        - date_to: Filter tasks created before this date (YYYY-MM-DD)
        - deadline_from: Filter by deadline start date
        - deadline_to: Filter by deadline end date
        - overdue: Show only overdue tasks (true/false)
        - sort: Sort by field (created_at, deadline, priority, title)
        - order: Sort order (asc/desc)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskListSerializer

    def get_queryset(self):
        """Return filtered and sorted tasks for the authenticated user"""
        from django.db.models import Q
        from datetime import datetime
        
        user = self.request.user
        queryset = Task.objects.filter(user=user)
        
        # Search by keyword (in title or description)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
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
        
        # Filter by creation date range
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d')
                queryset = queryset.filter(created_at__lte=to_date)
            except ValueError:
                pass
        
        # Filter by deadline range
        deadline_from = self.request.query_params.get('deadline_from', None)
        if deadline_from:
            try:
                from_date = datetime.strptime(deadline_from, '%Y-%m-%d')
                queryset = queryset.filter(deadline__gte=from_date)
            except ValueError:
                pass
        
        deadline_to = self.request.query_params.get('deadline_to', None)
        if deadline_to:
            try:
                to_date = datetime.strptime(deadline_to, '%Y-%m-%d')
                queryset = queryset.filter(deadline__lte=to_date)
            except ValueError:
                pass
        
        # Filter overdue tasks
        overdue = self.request.query_params.get('overdue', None)
        if overdue and overdue.lower() in ['true', '1', 'yes']:
            from django.utils import timezone
            queryset = queryset.filter(
                deadline__lt=timezone.now(),
                completed=False
            )
        
        # Sorting
        sort_by = self.request.query_params.get('sort', 'created_at')
        order = self.request.query_params.get('order', 'desc')
        
        # Map sort fields
        sort_fields = {
            'created_at': 'created_at',
            'deadline': 'deadline',
            'priority': 'priority',
            'title': 'title',
            'updated_at': 'updated_at',
        }
        
        sort_field = sort_fields.get(sort_by, 'created_at')
        
        # Apply ordering
        if order.lower() == 'asc':
            queryset = queryset.order_by(sort_field)
        else:
            queryset = queryset.order_by(f'-{sort_field}')
        
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
        was_completed = task.completed
        task.completed = not task.completed
        task.save()
        
        # Send completion email if task is now completed and email hasn't been sent
        email_sent = False
        if task.completed and not was_completed and not task.completion_email_sent:
            try:
                send_task_completion_email(task)
                email_sent = True
            except Exception as e:
                print(f"Failed to send completion email: {e}")
        
        response_serializer = TaskSerializer(task)
        
        status_text = "completed" if task.completed else "incomplete"
        
        return Response({
            'task': response_serializer.data,
            'message': f'Task marked as {status_text}',
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)


class TaskSearchView(APIView):
    """
    Advanced task search with detailed results
    
    GET /api/tasks/search/
    
    Query Parameters:
        - q: Search query (searches in title and description)
        - priority: Filter by priority
        - category: Filter by category
        - completed: Filter by completion status
        - date_from: Created after date
        - date_to: Created before date
        - deadline_from: Deadline after date
        - deadline_to: Deadline before date
        - overdue: Show only overdue tasks
        - sort: Sort field
        - order: Sort order (asc/desc)
    
    Returns detailed search results with metadata
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Q
        from datetime import datetime
        from django.utils import timezone
        
        user = request.user
        queryset = Task.objects.filter(user=user)
        
        # Get all search parameters
        search_query = request.query_params.get('q', '')
        priority = request.query_params.get('priority', None)
        category = request.query_params.get('category', None)
        completed = request.query_params.get('completed', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        deadline_from = request.query_params.get('deadline_from', None)
        deadline_to = request.query_params.get('deadline_to', None)
        overdue = request.query_params.get('overdue', None)
        sort_by = request.query_params.get('sort', 'created_at')
        order = request.query_params.get('order', 'desc')
        
        # Track applied filters
        applied_filters = []
        
        # Search by keyword
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
            applied_filters.append(f"Search: '{search_query}'")
        
        # Apply filters
        if priority:
            queryset = queryset.filter(priority=priority)
            applied_filters.append(f"Priority: {priority}")
        
        if category:
            queryset = queryset.filter(category=category)
            applied_filters.append(f"Category: {category}")
        
        if completed is not None:
            is_completed = completed.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(completed=is_completed)
            applied_filters.append(f"Completed: {is_completed}")
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                queryset = queryset.filter(created_at__gte=from_date)
                applied_filters.append(f"Created after: {date_from}")
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d')
                queryset = queryset.filter(created_at__lte=to_date)
                applied_filters.append(f"Created before: {date_to}")
            except ValueError:
                pass
        
        if deadline_from:
            try:
                from_date = datetime.strptime(deadline_from, '%Y-%m-%d')
                queryset = queryset.filter(deadline__gte=from_date)
                applied_filters.append(f"Deadline after: {deadline_from}")
            except ValueError:
                pass
        
        if deadline_to:
            try:
                to_date = datetime.strptime(deadline_to, '%Y-%m-%d')
                queryset = queryset.filter(deadline__lte=to_date)
                applied_filters.append(f"Deadline before: {deadline_to}")
            except ValueError:
                pass
        
        if overdue and overdue.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(
                deadline__lt=timezone.now(),
                completed=False
            )
            applied_filters.append("Overdue tasks only")
        
        # Sorting
        sort_fields = {
            'created_at': 'created_at',
            'deadline': 'deadline',
            'priority': 'priority',
            'title': 'title',
            'updated_at': 'updated_at',
        }
        
        sort_field = sort_fields.get(sort_by, 'created_at')
        
        if order.lower() == 'asc':
            queryset = queryset.order_by(sort_field)
            sort_info = f"Sorted by {sort_by} (ascending)"
        else:
            queryset = queryset.order_by(f'-{sort_field}')
            sort_info = f"Sorted by {sort_by} (descending)"
        
        # Get results
        tasks = queryset
        serializer = TaskListSerializer(tasks, many=True)
        
        # Prepare response with metadata
        return Response({
            'search_results': {
                'count': tasks.count(),
                'tasks': serializer.data,
            },
            'search_metadata': {
                'query': search_query if search_query else 'No search query',
                'filters_applied': applied_filters if applied_filters else ['No filters'],
                'sorting': sort_info,
                'total_results': tasks.count(),
            }
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


class TimeSpentByCategoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        from datetime import date as date_type
        from django.utils.dateparse import parse_date

        def format_minutes(total_minutes: int) -> str:
            hours = total_minutes // 60
            minutes = total_minutes % 60
            if hours <= 0:
                return f"{minutes}m"
            if minutes <= 0:
                return f"{hours}h"
            return f"{hours}h {minutes}m"

        user = request.user

        now_local = timezone.localtime(timezone.now())
        today = now_local.date()

        range_param = (request.query_params.get('range') or 'daily').lower()
        from_param = request.query_params.get('from')
        to_param = request.query_params.get('to')

        if range_param in ['day', 'daily']:
            range_param = 'daily'
        elif range_param in ['week', 'weekly']:
            range_param = 'weekly'

        start_date: date_type
        end_date: date_type

        if from_param or to_param:
            parsed_from = parse_date(from_param) if from_param else None
            parsed_to = parse_date(to_param) if to_param else None
            if from_param and not parsed_from:
                return Response({'detail': 'Invalid from date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
            if to_param and not parsed_to:
                return Response({'detail': 'Invalid to date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

            start_date = parsed_from or today
            end_date = parsed_to or today
        else:
            if range_param == 'weekly':
                start_date = today - timedelta(days=6)
                end_date = today
            else:
                start_date = today
                end_date = today

        if start_date > end_date:
            start_date, end_date = end_date, start_date

        base_qs = Task.objects.filter(
            user=user,
            task_date__gte=start_date,
            task_date__lte=end_date,
            start_time__isnull=False,
            end_time__isnull=False,
        )

        aggregates = (
            base_qs.values('category')
            .annotate(tasks=Count('id'), total_minutes=Sum('duration'))
            .order_by('-total_minutes')
        )

        label_map = dict(Task.CATEGORY_CHOICES)

        category_id_map = {key: idx for idx, (key, _) in enumerate(Task.CATEGORY_CHOICES, start=1)}

        categories = []
        grand_total = 0
        total_tasks = 0
        for row in aggregates:
            total_minutes = int(row['total_minutes'] or 0)
            task_count = int(row['tasks'] or 0)
            grand_total += total_minutes
            total_tasks += task_count
            category_key = row['category']
            categories.append({
                'category_id': category_id_map.get(category_key),
                'category_key': category_key,
                'label': label_map.get(category_key, category_key),
                'tasks': task_count,
                'total_minutes': total_minutes,
                'total_time': format_minutes(total_minutes),
            })

        for item in categories:
            if grand_total > 0:
                item['percentage'] = int(round((item['total_minutes'] / grand_total) * 100))
            else:
                item['percentage'] = 0

        return Response({
            'range': range_param,
            'from': start_date,
            'to': end_date,
            'total_tasks': total_tasks,
            'total_minutes': grand_total,
            'total_time': format_minutes(grand_total),
            'categories': categories,
        }, status=status.HTTP_200_OK)


class CompletionRateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        from django.utils.dateparse import parse_date

        user = request.user

        now_local = timezone.localtime(timezone.now())
        today = now_local.date()

        range_param = (request.query_params.get('range') or 'daily').lower()
        from_param = request.query_params.get('from')
        to_param = request.query_params.get('to')

        if range_param in ['day', 'daily']:
            range_param = 'daily'
        elif range_param in ['week', 'weekly']:
            range_param = 'weekly'

        if from_param or to_param:
            parsed_from = parse_date(from_param) if from_param else None
            parsed_to = parse_date(to_param) if to_param else None
            if from_param and not parsed_from:
                return Response({'detail': 'Invalid from date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
            if to_param and not parsed_to:
                return Response({'detail': 'Invalid to date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
            start_date = parsed_from or today
            end_date = parsed_to or today
        else:
            if range_param == 'weekly':
                start_date = today - timedelta(days=6)
                end_date = today
            else:
                start_date = today
                end_date = today

        if start_date > end_date:
            start_date, end_date = end_date, start_date

        tasks = Task.objects.filter(
            user=user,
            task_date__gte=start_date,
            task_date__lte=end_date,
        )

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(completed=True).count()

        overdue_tasks = tasks.filter(
            completed=False,
            deadline__isnull=False,
            deadline__lt=timezone.now(),
        ).count()

        pending_tasks = tasks.filter(completed=False).count()

        # "skipped" is not yet represented in the DB schema; returning 0 for now.
        skipped_tasks = 0

        completion_rate = (completed_tasks / total_tasks) if total_tasks > 0 else 0

        return Response({
            'range': range_param,
            'from': start_date,
            'to': end_date,
            'total_tasks': total_tasks,
            'status_counts': {
                'completed': completed_tasks,
                'pending': pending_tasks,
                'skipped': skipped_tasks,
                'overdue': overdue_tasks,
            },
            'completion_rate': round(completion_rate * 100, 2),
        }, status=status.HTTP_200_OK)


class WeeklyTrendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        from django.utils.dateparse import parse_date
        from django.db.models.functions import ExtractIsoWeek, ExtractIsoYear

        user = request.user
        now_local = timezone.localtime(timezone.now())
        today = now_local.date()

        weeks_param = request.query_params.get('weeks')
        from_param = request.query_params.get('from')
        to_param = request.query_params.get('to')

        if from_param or to_param:
            parsed_from = parse_date(from_param) if from_param else None
            parsed_to = parse_date(to_param) if to_param else None
            if from_param and not parsed_from:
                return Response({'detail': 'Invalid from date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
            if to_param and not parsed_to:
                return Response({'detail': 'Invalid to date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
            start_date = parsed_from or today
            end_date = parsed_to or today
        else:
            try:
                weeks_back = int(weeks_param) if weeks_param else 4
            except ValueError:
                return Response({'detail': 'Invalid weeks. Must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

            if weeks_back < 1:
                weeks_back = 1

            start_date = today - timedelta(days=(weeks_back * 7) - 1)
            end_date = today

        if start_date > end_date:
            start_date, end_date = end_date, start_date

        qs = Task.objects.filter(
            user=user,
            task_date__gte=start_date,
            task_date__lte=end_date,
            start_time__isnull=False,
            end_time__isnull=False,
        )

        aggregates = (
            qs.annotate(
                iso_year=ExtractIsoYear('task_date'),
                iso_week=ExtractIsoWeek('task_date'),
            )
            .values('iso_year', 'iso_week')
            .annotate(
                planned_minutes=Sum('duration'),
                completed_minutes=Sum(
                    Case(
                        When(completed=True, then='duration'),
                        default=0,
                        output_field=IntegerField(),
                    )
                ),
            )
            .order_by('iso_year', 'iso_week')
        )

        weeks = []
        for row in aggregates:
            planned_minutes = int(row['planned_minutes'] or 0)
            completed_minutes = int(row['completed_minutes'] or 0)
            completion_rate = (completed_minutes / planned_minutes * 100) if planned_minutes > 0 else 0

            iso_year = int(row['iso_year'])
            iso_week = int(row['iso_week'])
            week_label = f"{iso_year}-W{iso_week:02d}"

            weeks.append({
                'week_label': week_label,
                'planned_minutes': planned_minutes,
                'completed_minutes': completed_minutes,
                'completion_rate': round(completion_rate, 1),
            })

        return Response({'weeks': weeks}, status=status.HTTP_200_OK)


class UpcomingDeadlinesView(APIView):
    """
    Get upcoming deadline tasks
    
    GET /api/tasks/upcoming-deadlines/
    
    Query Parameters (optional):
        - hours: Show tasks with deadlines within this many hours (default: 24)
        - limit: Maximum number of tasks to return (default: 10)
    
    Returns tasks with deadlines approaching soon
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        
        user = request.user
        now = timezone.now()
        
        # Get hours parameter (default: 24 hours)
        hours_ahead = int(request.query_params.get('hours', 24))
        limit = int(request.query_params.get('limit', 10))
        
        # Calculate future time
        future_time = now + timedelta(hours=hours_ahead)
        
        # Find upcoming deadline tasks
        upcoming_tasks = Task.objects.filter(
            user=user,
            deadline__gte=now,
            deadline__lte=future_time,
            completed=False
        ).order_by('deadline')[:limit]
        
        # Serialize tasks and add time calculations
        tasks_with_time = []
        for task in upcoming_tasks:
            time_until = task.deadline - now
            hours_until = int(time_until.total_seconds() / 3600)
            minutes_until = int((time_until.total_seconds() % 3600) / 60)
            
            if hours_until > 0:
                time_str = f"{hours_until} hour(s) and {minutes_until} minute(s)"
            else:
                time_str = f"{minutes_until} minute(s)"
            
            # Serialize individual task
            task_serializer = TaskListSerializer(task)
            task_data = task_serializer.data
            task_data['time_until_deadline'] = time_str
            task_data['hours_until'] = hours_until
            task_data['minutes_until'] = minutes_until
            tasks_with_time.append(task_data)
        
        return Response({
            'upcoming_deadlines': {
                'count': upcoming_tasks.count(),
                'hours_ahead': hours_ahead,
                'tasks': tasks_with_time,
            },
            'message': f'Found {upcoming_tasks.count()} task(s) with deadlines within {hours_ahead} hours'
        }, status=status.HTTP_200_OK)

