from pydantic import BaseModel


class SuccessfullValidationResponse(BaseModel):
    detail: str


class ValidationErrorResponse(BaseModel):
    detail: str
