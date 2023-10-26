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
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullValidationResponse,
    responses={
        400: {"model": ValidationErrorResponse},
        401: {"model": ValidationErrorResponse},
        403: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
)
async def approve_physician(physician_id: str, uid=Depends(Auth.is_admin)):
    """
    Validate a physician.

    This will allow superusers to approve physicians.

    This path operation will:

    * Validate a physician.
    * Change the _approved_ field from Physicians from _pending_ to _approved_.
    * Throw an error if the validation fails.
    """
    try:
        if not Physician.is_physician(physician_id):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Can only approve physicians"},
            )
        Admin.approve_physician(physician_id)
        physician = Physician.get_by_id(physician_id)
        requests.post(
            "http://localhost:9000/emails/send",
            json={
                "type": "PHYSICIAN_APPROVED_ACCOUNT",
                "data": {
                    "email": physician["email"],
                },
            },
        )
        return {"message": "Physician validated successfully"}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/deny-physician/{physician_id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullValidationResponse,
    responses={
        400: {"model": ValidationErrorResponse},
        401: {"model": ValidationErrorResponse},
        403: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
)
async def deny_physician(physician_id: str, uid=Depends(Auth.is_admin)):
    """
    Validate a physician.

    This will allow superusers to deny physicians.

    This path operation will:

    * Validate a physician.
    * Change the _approved_ field from Physicians from _pending_ to _denied_.
    * Throw an error if the validation fails.
    """
    try:
        if not Physician.is_physician(physician_id):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Can only deny physicians"},
            )
        Admin.deny_physician(physician_id)
        physician = Physician.get_by_id(physician_id)
        requests.post(
            "http://localhost:9000/emails/send",
            json={
                "type": "PHYSICIAN_DENIED_ACCOUNT",
                "data": {
                    "email": physician["email"],
                },
            },
        )
        return {"message": "Physician denied successfully"}
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
def regsiter_admin(admin_resgister_request: AdminRegisterRequest):
    """
    Register an admin.

    This will allow superusers to register admins.

    This path operation will:

    * Register an admin.
    * Throw an error if the registration fails.
    """
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
    admin = Admin(
        **admin_resgister_request.dict(), id=auth_uid, registered_by="qwertyui"
    )
    admin.create()
    return {"message": "Successfull registration"}
