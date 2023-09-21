from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Appointment import Appointment
from app.models.requests.AppointmentRequests import AppointmentCreationRequest
from app.models.responses.AppointmentResponses import (
    SuccessfulAppointmentCreationResponse,
    AppointmentCreationError,
)

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfulAppointmentCreationResponse,
    responses={
        401: {"model": AppointmentCreationError},
        500: {"model": AppointmentCreationError},
    },
)
async def create_appointment(
    appointment_creation_request: AppointmentCreationRequest,
    patient=Depends(Auth.is_logged_in),
):
    """
    Create an appointment.

    This will allow authenticated users to create appointments with their physician of choice.

    This path operation will:

    * Create an appointment.
    * Return the appointments id.
    * Throw an error if appointment creation fails.
    """
    appointment = Appointment(
        **{**appointment_creation_request.dict(), "patient": patient}
    )
    try:
        appointment_id = appointment.create()
        return {"appointment_id": appointment_id}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
