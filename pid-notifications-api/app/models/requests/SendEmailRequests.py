from pydantic import BaseModel


class SendEmailTemplateRequest(BaseModel):
    type: str
    data: object
