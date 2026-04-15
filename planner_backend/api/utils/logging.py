from api.models import AuditLog

def log_event(level, event, message, request=True, user=True):
    """
    Utility to record an audit log entry.
    usage: log_event('INFO', 'USER_LOGIN', f'User {u.email} logged in', request=request)
    """
    from django.contrib.auth.models import AnonymousUser
    
    actor = None
    actor_email = None
    path = None
    ip_address = None
    
    # Try to extract details from request if provided
    if request and not isinstance(request, bool):
        path = request.path
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
            
        if not user or isinstance(user, bool):
            user = getattr(request, 'user', None)

    # Handle User object
    if user and not isinstance(user, bool) and not isinstance(user, AnonymousUser):
        actor = user
        actor_email = user.email

    try:
        AuditLog.objects.create(
            level=level,
            event=event,
            message=message,
            actor=actor,
            actor_email=actor_email,
            path=path,
            ip_address=ip_address
        )
    except Exception as e:
        # We don't want audit logging to ever crash the main application
        print(f"FAILED TO WRITE AUDIT LOG: {e}")
