from pydantic import BaseModel

from .PhysicianResponses import PhysicianResponse
from app.models.entities.Physician import Physician

class SuccessfullValidationResponse(BaseModel):
    detail: str


class ValidationErrorResponse(BaseModel):
    detail: str

class GetPendingValidationsError(BaseModel):
    detail: str


class AllPendingValidationsResponse(BaseModel):
    physicians_pending_validation: list