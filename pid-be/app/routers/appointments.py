from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Appointment import Appointment
from app.models.requests.AppointmentRequests import AppointmentCreationRequest
from app.models.responses.AppointmentResponses import (
    SuccessfulAppointmentCreationResponse,
    AppointmentCreationError,
    GetAppointmentError,
    AllAppointmentsResponse,
    BasicAppointmentResponse,
    SuccessfulAppointmentDeletionResponse,
    DeleteAppointmentError,
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
        400: {"model": AppointmentCreationError},
        401: {"model": AppointmentCreationError},
        500: {"model": AppointmentCreationError},
    },
)
async def create_appointment(
    appointment_creation_request: AppointmentCreationRequest,
    patient_id=Depends(Auth.is_logged_in),
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
        **{**appointment_creation_request.dict(), "patient_id": patient_id}
    )
    try:
        appointment_id = appointment.create()
        return {"appointment_id": appointment_id}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=AllAppointmentsResponse,
    responses={
        401: {"model": GetAppointmentError},
        500: {"model": GetAppointmentError},
    },
)
def get_all_appointments(uid=Depends(Auth.is_logged_in)):
    """
    Get all appointments.

    This will allow authenticated users to retrieve all their appointments.

    This path operation will:

    * Return all of users appointments.
    * Throw an error if appointment retrieving fails.
    """
    try:
        appointments = Appointment.get_all_appointments_for_user_with(uid)
        return {"appointments": appointments}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulAppointmentDeletionResponse,
    responses={
        400: {"model": DeleteAppointmentError},
        401: {"model": DeleteAppointmentError},
        500: {"model": DeleteAppointmentError},
    },
)
def delete_appointment_by_id(id: str, uid=Depends(Auth.is_logged_in)):
    """
    Delete an appointment.

    This will allow authenticated users to delete one of their appointments.

    This path operation will:

    * Delete an appointments.
    * Throw an error if appointment doesn't exist.
    * Throw an error if appointment doesn't belong to the authenticated user.
    * Throw an error if appointment retrieving fails.
    """
    try:
        appointment = Appointment.get_by_id(id)
        if not appointment or appointment["patient_id"] != uid:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid appointment id"},
            )
        Appointment.delete_by_id(id)
        return {"message": "Appointment cancelled successfully"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
