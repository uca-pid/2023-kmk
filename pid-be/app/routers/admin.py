import os
import requests
import json
from dotenv import load_dotenv
from firebase_admin import auth
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Physician import Physician
from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.responses.AdminResponses import (
    SuccessfullAdminRegistrationResponse,
    AdminRegistrationError,
)
from app.models.requests.AdminRequests import AdminRegisterRequest
from app.models.responses.ValidationResponses import (
    SuccessfullValidationResponse,
    ValidationErrorResponse,
    AllPendingValidationsResponse,
    GetPendingValidationsError,
)

load_dotenv()

router = APIRouter(
    prefix="/admin",
    tags=["Admins"],
    responses={404: {"description": "Not found"}},
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())


@router.post(
    "/approve-physician/{physician_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullValidationResponse,
    responses={
        401: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
    # dependencies=[Depends(Auth.is_admin)],
)
async def approve_physician(
    physician_id: str,
):
    """
    Validate a physician.

    This will allow superusers to approve physicians.

    This path operation will:

    * Validate a physician.
    * Change the "approved" field from Physicians from "pending" to "approved".
    * Throw an error if the validation fails.
    """
    try:
        validated_id = Physician.approve_physician(physician_id)
        validated_phyisician = Physician.get_by_id(validated_id)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "detail": "Physician validated successfully",
                "approved_physician": validated_phyisician,
            },
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/deny-physician/{physician_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullValidationResponse,
    responses={
        401: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
    # dependencies=[Depends(Auth.is_admin)],
)
async def deny_physician(
    physician_id: str,
):
    """
    Validate a physician.

    This will allow superusers to approve physicians.

    This path operation will:

    * Validate a physician.
    * Change the "approved" field from Physicians from "pending" to "approved".
    * Throw an error if the validation fails.
    """
    try:
        denied_id = Physician.deny_physician(physician_id)
        denied_phyisician = Physician.get_by_id(denied_id)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "detail": "Physician denied successfully",
                "approved_physician": denied_phyisician,
            },
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/pending-validations",
    status_code=status.HTTP_200_OK,
    response_model=AllPendingValidationsResponse,
    responses={
        401: {"model": GetPendingValidationsError},
        500: {"model": GetPendingValidationsError},
    },
    # dependencies=[Depends(Auth.is_admin)],
)
def get_all_pending_validations():
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


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullAdminRegistrationResponse,
    responses={
        400: {"model": AdminRegistrationError},
        401: {"model": AdminRegistrationError},
        403: {"model": AdminRegistrationError},
        500: {"model": AdminRegistrationError},
    },
)
def regsiter_admin(
    admin_resgister_request: AdminRegisterRequest, uid=Depends(Auth.is_admin)
):
    url = os.environ.get("REGISTER_URL")
    auth_uid = None
    try:
        user = auth.get_user_by_email(admin_resgister_request.email)
        auth_uid = user.uid
    except:
        print("[+] User already doesnt exist in authentication")

    if not auth_uid:
        register_response = requests.post(
            url,
            json={
                "email": admin_resgister_request.email,
                "password": admin_resgister_request.password,
                "returnSecureToken": True,
            },
            params={"key": firebase_client_config["apiKey"]},
        )
        if register_response.status_code != 200:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"},
            )
        auth_uid = register_response.json()["localId"]

    del admin_resgister_request.password
    admin = Admin(**admin_resgister_request.dict(), id=auth_uid, registered_by=uid)
    admin.create()
    return {"message": "Successfull registration"}
