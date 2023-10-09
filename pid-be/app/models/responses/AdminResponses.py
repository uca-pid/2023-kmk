from pydantic import BaseModel


class SuccessfullAdminRegistrationResponse(BaseModel):
    message: str


class AdminRegistrationError(BaseModel):
    detail: str
