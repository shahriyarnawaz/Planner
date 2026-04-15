from rest_framework.views import APIView
from rest_framework.response import Response

class TriggerErrorView(APIView):
    def get(self, request):
        raise ValueError("DEBUG: Testing AuditLogMiddleware automated capture")
