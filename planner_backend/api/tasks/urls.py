"""
Tasks URL Configuration
All task management endpoints
"""

from django.urls import path
from .views import (
    TaskCreateView,
    TaskListView,
    TaskDetailView,
    TaskUpdateView,
    TaskDeleteView,
    TaskToggleCompleteView,
    TaskStatsView,
)

urlpatterns = [
    # Task CRUD
    path('create/', TaskCreateView.as_view(), name='task-create'),
    path('', TaskListView.as_view(), name='task-list'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/update/', TaskUpdateView.as_view(), name='task-update'),
    path('<int:pk>/delete/', TaskDeleteView.as_view(), name='task-delete'),
    
    # Task Actions
    path('<int:pk>/toggle-complete/', TaskToggleCompleteView.as_view(), name='task-toggle-complete'),
    
    # Task Statistics
    path('stats/', TaskStatsView.as_view(), name='task-stats'),
]

