import os
import requests
import json
from dotenv import load_dotenv
from firebase_admin import auth
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
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
    response_model=AllPendingValidationsResponse,
    responses={
        401: {"model": GetPendingValidationsError},
        403: {"model": GetPendingValidationsError},
        500: {"model": GetPendingValidationsError},
    },
)
def get_all_pending_validations(uid=Depends(Auth.is_admin)):
    """
    Get all physicians pending approval.

    This will allow superusers to retrieve all pending validations.

    This path operation will:

    * Return all of physicians pending validations.
    * Throw an error if appointment retrieving fails.
    """
    try:
        physicians_to_validate = Physician.get_pending_physicians()
        return {"physicians_pending_validation": physicians_to_validate}
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
    * Throw an error if appointment retrieving fails.
    """
    try:
        physicians_to_validate = Physician.get_pending_physicians()
        return {"dashboard_metrics": physicians_to_validate}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
