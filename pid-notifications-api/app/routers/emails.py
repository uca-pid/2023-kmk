from fastapi import APIRouter, status

from app.models.requests.SendEmailRequests import SendEmailTemplateRequest
from app.models.entities.EmailHandler import EmailHandler

router = APIRouter(
    prefix="/emails", tags=["Emails"], responses={404: {"description": "Not found"}}
)


@router.post("/send", status_code=status.HTTP_200_OK)
async def send_email_template(send_email_template_request: SendEmailTemplateRequest):
    email_handler = EmailHandler(**send_email_template_request.model_dump())
    await email_handler.send_email()
