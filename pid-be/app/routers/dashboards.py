import os
import requests
import json
from dotenv import load_dotenv
from firebase_admin import auth
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.entities.Appointment import Appointment
from app.models.responses.DashboardResponses import (
    SuccessfullDashboardResponse,
    DashboardErrorResponse,
)

load_dotenv()

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    responses={404: {"description": "Not found"}},
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())


@router.get(
    "/admin",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullDashboardResponse,
    responses={
        401: {"model": DashboardErrorResponse},
        403: {"model": DashboardErrorResponse},
        500: {"model": DashboardErrorResponse},
    },
)
def get_admin_dashboard(uid=Depends(Auth.is_admin)):
    """
    Get admin dashboard.

    This will allow admins to retrieve the metrics insights.

    This path operation will:

    * Return the admin metrics.
    * Throw an error if dashboard retrieving fails.
    """
    try:
        all_appointments = len(Appointment.get_all_appointments())
        updated_appointments = len(Appointment.get_all_appointments_updtated())
        return {"dashboard_metrics": {"all_appointments": all_appointments, "updated_appointments": updated_appointments}}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/physician",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullDashboardResponse,
    responses={
        401: {"model": DashboardErrorResponse},
        403: {"model": DashboardErrorResponse},
        500: {"model": DashboardErrorResponse},
    },
)
def get_physician_dashboard(uid=Depends(Auth.is_logged_in)):
    """
    Get physician dashboard.

    This will allow physicians to retrieve their metrics insights.

    This path operation will:

    * Return the physician metrics.
    * Throw an error if dashboard retrieving fails.
    """
    try:
        all_appointments = len(Appointment.get_all_appointments_for_physician_with(uid))
        updated_appointments = len(Appointment.get_all_appointments_updtated_for_physician(uid))
        return {"dashboard_metrics": {"all_appointments": all_appointments, "updated_appointments": updated_appointments}}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
