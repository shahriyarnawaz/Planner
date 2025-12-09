from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, Task


class UserProfileInline(admin.StackedInline):
    """Display UserProfile inline with User in admin"""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('role', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


class UserAdmin(BaseUserAdmin):
    """Extended User admin with profile inline"""
    inlines = (UserProfileInline,)
    list_display = ('email', 'first_name', 'last_name', 'get_role', 'is_active', 'date_joined')
    list_filter = ('profile__role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    def get_role(self, obj):
        """Display user role"""
        return obj.profile.role if hasattr(obj, 'profile') else 'N/A'
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'profile__role'


# Unregister default User admin and register custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register UserProfile separately for direct access
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at', 'updated_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


# Register Task model
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'category', 'completed', 'deadline', 'created_at')
    list_filter = ('priority', 'category', 'completed', 'created_at')
    search_fields = ('title', 'description', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'is_overdue')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description')
        }),
        ('Task Details', {
            'fields': ('priority', 'category', 'deadline', 'duration', 'completed')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_overdue'),
            'classes': ('collapse',)
        }),
    )
