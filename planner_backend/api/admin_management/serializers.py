"""
Serializers for Admin Management
Only Super Admin can create user accounts
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from api.models import UserProfile


class CreateUserSerializer(serializers.ModelSerializer):
    """
    Serializer to create user accounts
    Only accessible by Super Admin
    Role is always 'user' (cannot create super_admin)
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password']

    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        """Create user account with 'user' role"""
        validated_data.pop('confirm_password')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Role is automatically 'user' from the signal
        # No need to change it
        
        return user


class UserWithRoleSerializer(serializers.ModelSerializer):
    """
    Serializer to display user information with role
    """
    role = serializers.CharField(source='profile.role', read_only=True)
    created_at = serializers.DateTimeField(source='profile.created_at', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'created_at']

