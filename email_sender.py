import mimetypes
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("GMAIL_EMAIL")
APP_PASSWORD = os.getenv("GMAIL_PASSWORD")


def send_email(to_email: str, subject: str, message: str, attachment_path: str = None, attachment_name: str = None):
    """
    Sends an email to a single recipient.

    Args:
        to_email (str): Recipient email address.
        subject (str): Email subject.
        message (str): Email body.
        attachment_path (str, optional): Path to a file to attach.
        attachment_name (str, optional): Filename to use for attachment.
    """

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email
    msg.set_content(message)

    if attachment_path:
        attachment_name = attachment_name or os.path.basename(attachment_path)
        mime_type, _ = mimetypes.guess_type(attachment_path)
        maintype, subtype = (mime_type or "application/octet-stream").split("/", 1)

        with open(attachment_path, "rb") as attachment_file:
            msg.add_attachment(
                attachment_file.read(),
                maintype=maintype,
                subtype=subtype,
                filename=attachment_name,
            )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL, APP_PASSWORD)
        smtp.send_message(msg)

    print(f"Email sent successfully to {to_email}")