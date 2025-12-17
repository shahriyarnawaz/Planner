from rest_framework import generics, permissions

from api.models import TaskTemplate
from api.permissions import IsOwnerOrSuperAdmin
from .serializers import TaskTemplateSerializer


class TemplateListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskTemplateSerializer

    def get_queryset(self):
        return TaskTemplate.objects.filter(user=self.request.user).prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TemplateUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]
    serializer_class = TaskTemplateSerializer

    def get_queryset(self):
        return TaskTemplate.objects.filter(user=self.request.user).prefetch_related('items')
