from pydantic import BaseModel
from typing import Optional


class SendEmailTemplateRequest(BaseModel):
    type: str
    data: Optional[object] = {}
