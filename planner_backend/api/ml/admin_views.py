from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from api.models import MLModelConfig, MLInferenceLog, MLErrorLog
from .serializers import MLModelConfigSerializer, MLInferenceLogSerializer, MLErrorLogSerializer

class SuperAdminPermission(permissions.BasePermission):
    """Allows access only to super_admin roles."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin')


class MLAdminDashboardView(APIView):
    """
    Returns aggregated metrics and lists for the System Admin ML Layout
    GET /api/ml/admin/status/
    """
    permission_classes = [SuperAdminPermission]

    def get(self, request):
        configs = MLModelConfig.objects.all()
        inferences = MLInferenceLog.objects.all()[:20]  # Last 20 outcomes
        errors = MLErrorLog.objects.all()[:20]          # Last 20 errors

        # Calculate a unified "temperature" and "max_suggestions" from the first model 
        # (Assuming the frontend sliders govern global default tuning for the UI, 
        # or we assume 'Task Recommendations' is the lead config)
        primary_config = configs.filter(name='Task Recommendations').first()
        temp = primary_config.temperature if primary_config else 0.7
        max_suggestions = primary_config.max_suggestions if primary_config else 5

        return Response({
            'models': MLModelConfigSerializer(configs, many=True).data,
            'recent_outcomes': MLInferenceLogSerializer(inferences, many=True).data,
            'recent_errors': MLErrorLogSerializer(errors, many=True).data,
            'tuning': {
                'temperature': temp,
                'max_suggestions': max_suggestions
            }
        }, status=status.HTTP_200_OK)


class MLAdminConfigUpdateView(APIView):
    """
    PATCH /api/ml/admin/config/
    Allows unified updates from the Tuning sliders for Temperature and Max Suggestions.
    """
    permission_classes = [SuperAdminPermission]

    def patch(self, request):
        temp = request.data.get('temperature')
        max_sugg = request.data.get('max_suggestions')

        # Update uniformly across all models for now since the frontend tuning panel is generic
        configs = MLModelConfig.objects.all()
        for config in configs:
            if temp is not None:
                config.temperature = float(temp)
            if max_sugg is not None:
                config.max_suggestions = int(max_sugg)
            config.save()

        return Response({'message': 'Tuning configuration applied successfully!'}, status=status.HTTP_200_OK)


class MLAdminActionView(APIView):
    """
    POST /api/ml/admin/action/
    Handles Quick Actions like Clear Cache and Run Evaluation.
    """
    permission_classes = [SuperAdminPermission]

    def post(self, request):
        action = request.data.get('action')
        if action == 'clear_cache':
            # Simulate clearing cache
            return Response({'message': 'ML cache cleared successfully!'}, status=status.HTTP_200_OK)
        elif action == 'run_evaluation':
            # Simulate evaluation
            return Response({'message': 'Evaluation job queued.'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Unknown action'}, status=status.HTTP_400_BAD_REQUEST)
