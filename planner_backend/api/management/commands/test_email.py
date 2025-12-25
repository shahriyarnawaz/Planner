"""
Management command to test email configuration
Run: python manage.py test_email
"""

from django.core.management.base import BaseCommand
from django.core.mail import EmailMessage
from django.conf import settings


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            help='Email address to send test email to',
            default=None,
        )

    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("📧 TESTING EMAIL CONFIGURATION"))
        self.stdout.write("="*60)
        
        # Check configuration
        email_host = getattr(settings, 'EMAIL_HOST', None)
        email_user = getattr(settings, 'EMAIL_HOST_USER', None)
        email_password = getattr(settings, 'EMAIL_HOST_PASSWORD', None)
        email_backend = getattr(settings, 'EMAIL_BACKEND', None)
        
        self.stdout.write(f"\n📋 Current Configuration:")
        self.stdout.write(f"   Backend: {email_backend}")
        self.stdout.write(f"   Host: {email_host}")
        self.stdout.write(f"   User: {email_user}")
        self.stdout.write(f"   Password: {'*' * len(email_password) if email_password else 'NOT SET'}")
        
        # Validate configuration
        if not email_user or email_user == 'your-email@gmail.com':
            self.stdout.write("\n" + "="*60)
            self.stdout.write(self.style.ERROR("❌ EMAIL NOT CONFIGURED!"))
            self.stdout.write("="*60)
            self.stdout.write("\n📝 Please update settings.py:")
            self.stdout.write("   EMAIL_HOST_USER = 'your-email@gmail.com'")
            self.stdout.write("   EMAIL_HOST_PASSWORD = 'your-app-password'")
            self.stdout.write("\n📖 See EMAIL_SETUP.md for detailed instructions")
            return
        
        if not email_password or email_password == 'your-app-password':
            self.stdout.write("\n" + "="*60)
            self.stdout.write(self.style.ERROR("❌ EMAIL PASSWORD NOT CONFIGURED!"))
            self.stdout.write("="*60)
            self.stdout.write("\n📝 Please update settings.py:")
            self.stdout.write("   EMAIL_HOST_PASSWORD = 'your-16-char-app-password'")
            self.stdout.write("\n📖 See EMAIL_SETUP.md for Gmail App Password setup")
            return
        
        # Get recipient email
        recipient = options.get('to') or email_user
        
        self.stdout.write(f"\n📧 Sending test email to: {recipient}")
        self.stdout.write("-"*60)
        
        try:
            subject = 'Test Email - Planner App'
            html_content = """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4CAF50;">✅ Email Configuration Test</h2>
                    <p>If you received this email, your SMTP configuration is working correctly!</p>
                    <p>Your Planner App email notifications are ready to use.</p>
                </div>
            </body>
            </html>
            """
            
            email = EmailMessage(
                subject=subject,
                body=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient]
            )
            email.content_subtype = "html"
            email.send()
            
            self.stdout.write("\n" + "="*60)
            self.stdout.write(self.style.SUCCESS("✅ TEST EMAIL SENT SUCCESSFULLY!"))
            self.stdout.write("="*60)
            self.stdout.write(f"✅ Email sent to: {recipient}")
            self.stdout.write(f"✅ Check your inbox (and spam folder)")
            self.stdout.write("="*60 + "\n")
            
        except Exception as e:
            error_msg = str(e)
            self.stdout.write("\n" + "="*60)
            self.stdout.write(self.style.ERROR("❌ EMAIL SENDING FAILED"))
            self.stdout.write("="*60)
            self.stdout.write(f"Error: {error_msg}")
            self.stdout.write("-"*60)
            
            if "535" in error_msg or "BadCredentials" in error_msg:
                self.stdout.write("\n🔧 GMAIL AUTHENTICATION ERROR:")
                self.stdout.write("="*60)
                self.stdout.write("1. ✅ Use Gmail App Password (NOT regular password)")
                self.stdout.write("2. ✅ Enable 2-Step Verification:")
                self.stdout.write("   → https://myaccount.google.com/security")
                self.stdout.write("3. ✅ Generate App Password:")
                self.stdout.write("   → https://myaccount.google.com/apppasswords")
                self.stdout.write("   → Select 'Mail' → 'Other' → 'Planner App'")
                self.stdout.write("   → Copy 16-character password (remove spaces)")
                self.stdout.write("4. ✅ Update settings.py with App Password")
                self.stdout.write("5. ✅ Restart Django server")
                self.stdout.write("="*60)
            else:
                self.stdout.write("\n🔧 Check:")
                self.stdout.write("1. Email settings in settings.py")
                self.stdout.write("2. Internet connection")
                self.stdout.write("3. Gmail account security")
                self.stdout.write("="*60)
            
            self.stdout.write("\n")




