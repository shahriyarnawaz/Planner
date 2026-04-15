import logging
from api.utils.logging import log_event
import traceback

logger = logging.getLogger(__name__)

class AuditLogMiddleware:
    """
    Middleware to automatically capture system errors and notable events.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Called when a view raises an exception.
        Captures the error and logs it as an ERROR audit log.
        """
        error_msg = f"Unhandled Exception: {str(exception)}\n{traceback.format_exc()}"
        
        # Log to AuditLog table
        log_event(
            level='ERROR',
            event='SYSTEM_ERROR',
            message=str(exception),
            request=request
        )
        
        # Also log to standard django logger
        logger.error(error_msg)
        
        return None # Let standard Django exception handling continue
