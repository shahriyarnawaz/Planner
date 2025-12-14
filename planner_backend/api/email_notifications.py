"""
Email Notification System
Sends emails for task creation and completion
"""

from django.core.mail import EmailMessage
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def send_task_creation_email(task):
    """
    Send email notification when a task is created
    """
    user = task.user
    
    subject = f'New Task Created: {task.title}'
    
    # HTML email body with time slot information
    time_slot_info = ""
    if task.task_date and task.start_time and task.end_time:
        time_slot_info = f"""
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Date:</strong></td>
                        <td style="padding: 8px;">{task.task_date.strftime("%B %d, %Y")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Time:</strong></td>
                        <td style="padding: 8px;">{task.start_time.strftime("%I:%M %p")} - {task.end_time.strftime("%I:%M %p")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Duration:</strong></td>
                        <td style="padding: 8px;">{task.calculated_duration} minutes</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Deadline:</strong></td>
                        <td style="padding: 8px;">{task.deadline.strftime("%B %d, %Y at %I:%M %p") if task.deadline else 'N/A'}</td>
                    </tr>
        """
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4CAF50;">✅ Task Created Successfully!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">{task.title}</h3>
                
                <p><strong>Description:</strong> {task.description or 'No description'}</p>
                
                <table style="width: 100%; margin: 15px 0;">
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Priority:</strong></td>
                        <td style="padding: 8px;">{task.get_priority_display()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; background: #f5f5f5;"><strong>Category:</strong></td>
                        <td style="padding: 8px;">{task.get_category_display()}</td>
                    </tr>
                    {time_slot_info}
                </table>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                📅 Created on: {task.created_at.strftime("%B %d, %Y at %I:%M %p")}
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
                This is an automated email from Planner App. Stay organized and productive!
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        print("\n" + "="*60)
        print("📧 SENDING TASK CREATION EMAIL")
        print("="*60)
        print(f"To: {user.email}")
        print(f"Subject: {subject}")
        print(f"Task: {task.title}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-"*60)
        
        # Check email configuration
        email_host = getattr(settings, 'EMAIL_HOST', 'Not set')
        email_user = getattr(settings, 'EMAIL_HOST_USER', 'Not set')
        email_backend = getattr(settings, 'EMAIL_BACKEND', 'Not set')
        
        print(f"📧 Email Backend: {email_backend}")
        print(f"📧 SMTP Host: {email_host}")
        print(f"📧 From Email: {email_user}")
        
        # Validate email settings
        if email_user == 'your-email@gmail.com' or email_user == 'Not set':
            print("\n⚠️ WARNING: Email credentials not configured!")
            print("⚠️ Please update EMAIL_HOST_USER in settings.py")
            raise ValueError("Email credentials not configured in settings.py")
        
        if not getattr(settings, 'EMAIL_HOST_PASSWORD', None) or settings.EMAIL_HOST_PASSWORD == 'your-app-password':
            print("\n⚠️ WARNING: Email password not configured!")
            print("⚠️ Please update EMAIL_HOST_PASSWORD in settings.py")
            raise ValueError("Email password not configured in settings.py")
        
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.content_subtype = "html"
        email.send()
        
        task.creation_email_sent = True
        task.save(update_fields=['creation_email_sent'])
        
        print("✅ EMAIL SENT SUCCESSFULLY!")
        print(f"✅ Email sent to: {user.email}")
        print(f"✅ Task ID: {task.id}")
        print(f"✅ Email marked as sent in database")
        print("="*60 + "\n")
        
        return True
    except ValueError as ve:
        print("\n" + "="*60)
        print("❌ EMAIL CONFIGURATION ERROR")
        print("="*60)
        print(f"Error: {str(ve)}")
        print("\n📋 SOLUTION:")
        print("1. Open: planner_backend/planner_backend/settings.py")
        print("2. Update EMAIL_HOST_USER with your Gmail address")
        print("3. Update EMAIL_HOST_PASSWORD with Gmail App Password")
        print("4. See EMAIL_SETUP.md for detailed instructions")
        print("="*60 + "\n")
        return False
    except Exception as e:
        error_msg = str(e)
        print("\n" + "="*60)
        print("❌ EMAIL SENDING FAILED")
        print("="*60)
        print(f"To: {user.email}")
        print(f"Error: {error_msg}")
        print(f"Task ID: {task.id}")
        print("-"*60)
        
        # Provide specific solutions based on error
        if "535" in error_msg or "BadCredentials" in error_msg or "Username and Password not accepted" in error_msg:
            print("\n🔧 GMAIL AUTHENTICATION ERROR - SOLUTIONS:")
            print("="*60)
            print("1. ✅ You MUST use Gmail App Password (NOT your regular password)")
            print("2. ✅ Enable 2-Step Verification first:")
            print("   → Go to: https://myaccount.google.com/security")
            print("   → Enable '2-Step Verification'")
            print("3. ✅ Generate App Password:")
            print("   → Go to: https://myaccount.google.com/apppasswords")
            print("   → Select 'Mail' and 'Other (Custom name)'")
            print("   → Enter 'Planner App'")
            print("   → Copy the 16-character password (no spaces)")
            print("4. ✅ Update settings.py:")
            print("   EMAIL_HOST_USER = 'your-email@gmail.com'")
            print("   EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # 16-char app password")
            print("5. ✅ Restart Django server after updating")
            print("="*60)
        elif "Connection" in error_msg or "refused" in error_msg.lower():
            print("\n🔧 CONNECTION ERROR - SOLUTIONS:")
            print("="*60)
            print("1. Check EMAIL_HOST = 'smtp.gmail.com'")
            print("2. Check EMAIL_PORT = 587")
            print("3. Check EMAIL_USE_TLS = True")
            print("4. Check your internet connection")
            print("5. Check firewall settings")
            print("="*60)
        else:
            print("\n🔧 GENERAL ERROR - CHECK:")
            print("="*60)
            print("1. Email settings in settings.py")
            print("2. Gmail account security settings")
            print("3. App Password is correct")
            print("4. Server logs for more details")
            print("="*60)
        
        print("="*60 + "\n")
        return False


def send_task_completion_email(task):
    """
    Send email notification when a task is completed or time is over
    """
    user = task.user
    
    if task.completed:
        subject = f'✅ Task Completed: {task.title}'
        status_message = 'completed'
        status_color = '#4CAF50'
    else:
        subject = f'⏰ Task Time Over: {task.title}'
        status_message = 'time is over'
        status_color = '#FF9800'
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
            <h2 style="color: {status_color};">Task {status_message.title()}!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">{task.title}</h3>
                
                <p><strong>Description:</strong> {task.description or 'No description'}</p>
                
                <p style="padding: 15px; background: #f0f0f0; border-left: 4px solid {status_color}; margin: 15px 0;">
                    <strong>Status:</strong> This task has been {status_message}!
                </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                🕐 Completed on: {task.updated_at.strftime("%B %d, %Y at %I:%M %p")}
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
                Great job staying organized! Keep up the good work! 💪
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        print("\n" + "="*60)
        print("📧 SENDING TASK COMPLETION EMAIL")
        print("="*60)
        print(f"To: {user.email}")
        print(f"Subject: {subject}")
        print(f"Task: {task.title}")
        print(f"Status: {status_message}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-"*60)
        
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.content_subtype = "html"
        email.send()
        
        task.completion_email_sent = True
        task.save(update_fields=['completion_email_sent'])
        
        print("✅ EMAIL SENT SUCCESSFULLY!")
        print(f"✅ Email sent to: {user.email}")
        print(f"✅ Task ID: {task.id}")
        print(f"✅ Email marked as sent in database")
        print("="*60 + "\n")
        
        return True
    except Exception as e:
        print("\n" + "="*60)
        print("❌ EMAIL SENDING FAILED")
        print("="*60)
        print(f"To: {user.email}")
        print(f"Error: {str(e)}")
        print(f"Task ID: {task.id}")
        print("="*60 + "\n")
        return False
