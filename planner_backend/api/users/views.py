"""
User Management Views
Handles user profile viewing, updating, and user listing
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User

from .serializers import UserSerializer, UserListSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to get and update user profile
    
    GET /api/users/profile/
    Returns the authenticated user's profile information
    
    PUT/PATCH /api/users/profile/
    Updates the authenticated user's profile
    
    Headers:
        - Authorization: Bearer <access_token>
    
    Returns:
        - User profile information
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        """Return the authenticated user"""
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        """Get user profile"""
        serializer = self.get_serializer(request.user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """Update user profile"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'user': serializer.data,
            'message': 'Profile updated successfully'
        }, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """
    API endpoint to list all users
    
    GET /api/users/list/
    
    Headers:
        - Authorization: Bearer <access_token>
    
    Returns:
        - List of all registered users
    
    Note: This is primarily for testing/admin purposes
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserListSerializer


class UserDetailView(generics.RetrieveAPIView):
    """
    API endpoint to get specific user details by ID
    
    GET /api/users/{id}/
    
    Headers:
        - Authorization: Bearer <access_token>
    
    Returns:
        - User information for specified user ID
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

