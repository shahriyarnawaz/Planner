"""
Admin Management Views
Only Super Admin can access these endpoints
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import transaction
from django.db.utils import OperationalError
import time

from api.permissions import IsSuperAdmin
from api.email_notifications import send_user_approved_email, send_user_disabled_email
from .serializers import (
    CreateUserSerializer,
    UserWithRoleSerializer,
)


class CreateUserView(generics.CreateAPIView):
    """
    Create User accounts
    
    POST /api/admin/create-user/
    
    Only Super Admin can access
    Created users always have 'user' role
    
    Request Body:
        - first_name (string, required)
        - last_name (string, required)
        - email (string, required)
        - password (string, required)
        - confirm_password (string, required)
    """
    queryset = User.objects.all()
    permission_classes = [IsSuperAdmin]
    serializer_class = CreateUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.profile.role,
            },
            'message': 'User account created successfully'
        }, status=status.HTTP_201_CREATED)


class ListAllUsersView(generics.ListAPIView):
    """
    List all users with their roles
    
    GET /api/admin/users/
    
    Only Super Admin can access
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsSuperAdmin]
    serializer_class = UserWithRoleSerializer


class DeactivateUserView(APIView):
    """
    Deactivate/Activate user account
    
    PATCH /api/admin/users/{user_id}/toggle-status/
    
    Only Super Admin can deactivate users
    """
    permission_classes = [IsSuperAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent deactivating super admin
        if user.profile.role == 'super_admin':
            return Response({
                'error': 'Cannot deactivate Super Admin'
            }, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason') if isinstance(request.data, dict) else None
        target_is_active = False if reason else True
        was_active = user.is_active

        for attempt in range(3):
            try:
                with transaction.atomic():
                    user.is_active = target_is_active
                    user.save(update_fields=['is_active'])
                    user.refresh_from_db(fields=['is_active'])
                break
            except OperationalError as e:
                if 'database is locked' not in str(e).lower() or attempt == 2:
                    return Response(
                        {'error': 'Database is locked. Please try again.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
                time.sleep(0.2 * (attempt + 1))

        if was_active and user.is_active is False:
            send_user_disabled_email(user, reason=reason)

        status_text = 'activated' if user.is_active else 'deactivated'
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
            },
            'message': f'User {status_text} successfully'
        }, status=status.HTTP_200_OK)


class ApproveUserView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(user, 'profile'):
            return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)

        if user.profile.role == 'super_admin':
            return Response({'error': 'Super Admin does not require approval'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save(update_fields=['is_active'])

        user.profile.is_approved = True
        user.profile.save(update_fields=['is_approved'])

        send_user_approved_email(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'is_approved': user.profile.is_approved,
            },
            'message': 'User approved successfully'
        }, status=status.HTTP_200_OK)


class GetUserStatsView(APIView):
    """
    Get user statistics
    
    GET /api/admin/stats/
    
    Only Super Admin can access
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        total_users = User.objects.count()
        super_admins = User.objects.filter(profile__role='super_admin').count()
        regular_users = User.objects.filter(profile__role='user').count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        return Response({
            'statistics': {
                'total_users': total_users,
                'super_admins': super_admins,
                'regular_users': regular_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
            }
        }, status=status.HTTP_200_OK)

