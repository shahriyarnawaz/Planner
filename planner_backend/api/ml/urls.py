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
    MakeRecurringView,
)

from .admin_views import (
    MLAdminDashboardView,
    MLAdminConfigUpdateView,
    MLAdminActionView
)

urlpatterns = [
    # Main recommendations endpoint
    path('recommendations/', MLRecommendationsView.as_view(), name='ml-recommendations'),
    
    # Individual ML features
    path('recurring-tasks/', RecurringTasksView.as_view(), name='recurring-tasks'),
    path('make-recurring/', MakeRecurringView.as_view(), name='make-recurring'),
    path('best-time/', BestTimeView.as_view(), name='best-time'),
    path('task-order/', TaskOrderView.as_view(), name='task-order'),
    path('insights/', InsightsView.as_view(), name='insights'),
    
    # Admin Monitoring 
    path('admin/status/', MLAdminDashboardView.as_view(), name='ml-admin-status'),
    path('admin/config/', MLAdminConfigUpdateView.as_view(), name='ml-admin-config'),
    path('admin/action/', MLAdminActionView.as_view(), name='ml-admin-action'),
]

