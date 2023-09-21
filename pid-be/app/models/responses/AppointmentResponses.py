from pydantic import BaseModel


class SuccessfulAppointmentCreationResponse(BaseModel):
    appointment_id: str


class AppointmentCreationError(BaseModel):
    detail: str
