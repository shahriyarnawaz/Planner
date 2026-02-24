from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from api.models import TaskTemplate, TaskTemplateItem, TemplateCategory
from api.permissions import IsOwnerOrSuperAdmin, IsSuperAdmin
from .serializers import TaskTemplateSerializer, TemplateCategorySerializer


class TemplateListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskTemplateSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        is_super_admin = bool(profile and (getattr(profile, 'role', None) == 'super_admin' or getattr(profile, 'is_super_admin', False)))

        qs = TaskTemplate.objects.all() if is_super_admin else TaskTemplate.objects.filter(user=user)
        return qs.prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return super().get_permissions()


class TemplateSaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, template_id):
        try:
            source = (
                TaskTemplate.objects.filter(id=template_id, user__profile__role='super_admin')
                .prefetch_related('items')
                .get()
            )
        except TaskTemplate.DoesNotExist:
            return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            new_template = TaskTemplate.objects.create(
                user=request.user,
                name=source.name,
                description=source.description,
            )

            items_to_create = []
            for item in source.items.all():
                items_to_create.append(
                    TaskTemplateItem(
                        template=new_template,
                        title=item.title,
                        description=item.description,
                        priority=item.priority,
                        category=item.category,
                        task_date=getattr(item, 'task_date', None),
                        start_time=item.start_time,
                        end_time=item.end_time,
                        duration=item.duration,
                        order=item.order,
                    )
                )

            if items_to_create:
                TaskTemplateItem.objects.bulk_create(items_to_create)

        serializer = TaskTemplateSerializer(new_template)
        return Response({'template': serializer.data}, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return super().get_permissions()


class TemplateUpdateView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSuperAdmin]
    serializer_class = TaskTemplateSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        is_super_admin = bool(profile and (getattr(profile, 'role', None) == 'super_admin' or getattr(profile, 'is_super_admin', False)))

        qs = TaskTemplate.objects.all() if is_super_admin else TaskTemplate.objects.filter(user=user)
        return qs.prefetch_related('items')


class GlobalTemplateListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskTemplateSerializer

    def get_queryset(self):
        return (
            TaskTemplate.objects.filter(user__profile__role='super_admin')
            .prefetch_related('items')
            .select_related('user', 'user__profile')
        )


class TemplateCategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TemplateCategorySerializer

    def get_queryset(self):
        return TemplateCategory.objects.all().order_by('name')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return super().get_permissions()


class TemplateCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TemplateCategorySerializer

    def get_queryset(self):
        return TemplateCategory.objects.all()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return super().get_permissions()
