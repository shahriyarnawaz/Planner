"""
Custom permissions for role-based access control
Only 2 roles: super_admin and user
"""

from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class to check if user is Super Admin
    Only super admins can access
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.role == 'super_admin'
    
    message = "Only Super Admin can perform this action."


class IsOwnerOrSuperAdmin(permissions.BasePermission):
    """
    Permission class to check if user is the owner of the object or super admin
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admin can access anything
        if hasattr(request.user, 'profile') and request.user.profile.is_super_admin:
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
    
    message = "You don't have permission to access this resource."

