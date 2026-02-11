"""
Authentication Views
Handles user registration, login, logout, and password management
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from api.email_notifications import send_signup_approval_request_email, send_user_approved_email

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    
    POST /api/auth/register/
    
    Request Body:
        - first_name (string, required)
        - last_name (string, required)
        - email (string, required)
        - password (string, required)
        - confirm_password (string, required)
    
    Returns:
        - User information
        - JWT access and refresh tokens
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        send_signup_approval_request_email(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.profile.role if hasattr(user, 'profile') else 'user',
                'is_approved': user.profile.is_approved if hasattr(user, 'profile') else False,
            },
            'message': 'Signup request submitted. Your account is pending Super Admin approval. You will receive an email once approved.',
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    API endpoint for user login
    
    POST /api/auth/login/
    
    Request Body:
        - email (string, required)
        - password (string, required)
    
    Returns:
        - User information
        - JWT access and refresh tokens
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = None

        if user is None or not user.check_password(password):
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if hasattr(user, 'profile') and not user.profile.is_approved:
            return Response({
                'error': "You can't login until the Super Admin approves your account. For approval updates, please check your email."
            }, status=status.HTTP_403_FORBIDDEN)

        if not user.is_active:
            return Response({
                'error': 'You are disabled by the Super Admin. For updates, please check your email.'
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.profile.role if hasattr(user, 'profile') else 'user',
                'is_approved': user.profile.is_approved if hasattr(user, 'profile') else True,
            },
            'message': 'Login successful',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    API endpoint for user logout
    
    POST /api/auth/logout/
    
    Request Body:
        - refresh_token (string, required)
    
    Headers:
        - Authorization: Bearer <access_token>
    
    Returns:
        - Success message
    
    Note: Blacklists the refresh token to prevent reuse
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token or token already blacklisted'
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    API endpoint to change user password
    
    POST /api/auth/change-password/
    
    Request Body:
        - old_password (string, required)
        - new_password (string, required)
        - confirm_password (string, required)
    
    Headers:
        - Authorization: Bearer <access_token>
    
    Returns:
        - Success message
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Set new password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """API endpoint to reset password using email (forgot password)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successfully"},
            status=status.HTTP_200_OK,
        )

