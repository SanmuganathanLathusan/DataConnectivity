import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_reset_password_email(email_to: str, token: str):
    if not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.warning("Email settings not configured. Skipping email send.")
        return False

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Reset your password - Data Connectivity"
    message["From"] = f"Data Connectivity <{settings.EMAIL_USER}>"
    message["To"] = email_to

    html = f"""
    <html>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; rounded-lg">
            <h2 style="color: #ef4444;">Reset Your Password</h2>
            <p>You requested to reset your password for your Data Connectivity account.</p>
            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{reset_link}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    </body>
    </html>
    """
    
    part = MIMEText(html, "html")
    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.sendmail(settings.EMAIL_USER, email_to, message.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
