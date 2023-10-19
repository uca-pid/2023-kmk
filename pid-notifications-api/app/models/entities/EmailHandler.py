import os
from dotenv import load_dotenv

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.models.entities.TemplateHandler import TemplateHandler

load_dotenv()


class EmailHandler:
    type: str
    data: object
    configuration = ConnectionConfig(
        MAIL_USERNAME=os.environ.get("MAIL_USERNAME"),
        MAIL_PASSWORD=os.environ.get("MAIL_PASSWORD"),
        MAIL_FROM=os.environ.get("MAIL_FROM"),
        MAIL_PORT=os.environ.get("MAIL_PORT"),
        MAIL_SERVER=os.environ.get("MAIL_SERVER"),
        MAIL_FROM_NAME=os.environ.get("MAIL_FROM_NAME"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
    )

    def __init__(self, type: str, data: object):
        self.type = type
        self.data = data

    async def send_email(self):
        template_handler = TemplateHandler(self.type, self.data)
        message = MessageSchema(
            subject="Bienvenido",
            recipients=[self.data["email"]],
            body=template_handler.generate_template(),
            subtype="html",
        )

        fm = FastMail(self.configuration)
        await fm.send_message(message)
