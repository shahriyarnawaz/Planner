"""
ML URL Configuration
Smart recommendations and predictions endpoints
"""

from django.urls import path
from .views import (
    MLRecommendationsView,
    RecurringTasksView,
    BestTimeView,
    TaskOrderView,
    InsightsView,
)

urlpatterns = [
    # Main recommendations endpoint
    path('recommendations/', MLRecommendationsView.as_view(), name='ml-recommendations'),
    
    # Individual ML features
    path('recurring-tasks/', RecurringTasksView.as_view(), name='recurring-tasks'),
    path('best-time/', BestTimeView.as_view(), name='best-time'),
    path('task-order/', TaskOrderView.as_view(), name='task-order'),
    path('insights/', InsightsView.as_view(), name='insights'),
]

