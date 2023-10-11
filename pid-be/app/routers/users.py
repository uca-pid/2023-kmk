import requests
import json
import os
from dotenv import load_dotenv
from typing import Union, Annotated

from fastapi import APIRouter, status, Depends, Body
from fastapi.responses import JSONResponse

from app.models.requests.UserRequests import (
    UserLoginRequest,
    PatientRegisterRequest,
    PhysicianRegisterRequest,
)
from app.models.responses.UserResponses import (
    SuccessfulLoginResponse,
    LoginErrorResponse,
    SuccessfullRegisterResponse,
    RegisterErrorResponse,
    UserRolesResponse,
    UserProfileErrorResponse,
    UserInfoResponse,
    UserInfoErrorResponse,
)

from app.models.entities.Auth import Auth
from app.models.entities.Patient import Patient
from app.models.entities.Physician import Physician
from app.models.entities.Admin import Admin
from app.models.entities.Record import Record

from firebase_admin import firestore, auth

db = firestore.client()

load_dotenv()

router = APIRouter(
    prefix="/users", tags=["Users"], responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebase_client_config = json.loads(fp.read())


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulLoginResponse,
    responses={
        400: {"model": LoginErrorResponse},
        403: {"model": LoginErrorResponse},
        500: {"model": LoginErrorResponse},
    },
)
async def login_user(
    user_login_request: UserLoginRequest,
    token=Depends(Auth.has_bearer_token),
):
    """
    Login a user.

    This will allow for unauthenticated clients to log into the system.

    This path operation will:

    * Login the user, performing validations on data received and on its validity.
    * Return the users Bearer token if login is successful.
    * Throw an error if login fails.
    """
    url = os.environ.get("LOGIN_URL")
    login_response = requests.post(
        url,
        json={
            "email": user_login_request.email,
            "password": user_login_request.password,
            "return_secure_token": True,
        },
        params={"key": firebase_client_config["apiKey"]},
    )
    if login_response.status_code == 400:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid email and/or password"},
        )
    elif login_response.status_code == 200:
        return {"token": login_response.json()["idToken"]}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullRegisterResponse,
    responses={
        400: {"model": RegisterErrorResponse},
        403: {"model": RegisterErrorResponse},
        500: {"model": RegisterErrorResponse},
    },
)
async def register(
    register_request: Annotated[
        Union[PatientRegisterRequest, PhysicianRegisterRequest],
        Body(discriminator="role"),
    ],
    token=Depends(Auth.has_bearer_token),
):
    """
    Register a user.
    This will allow users to register on the platform.
    This path operation will:
    * Register users, performing validations on data received and on its validity.
    * If the user is a patient, it's record will be created.
    * Throw an error if registration fails.
    """

    url = os.environ.get("REGISTER_URL")
    auth_uid = None
    try:
        user = auth.get_user_by_email(register_request.email)
        auth_uid = user.uid
    except:
        print("[+] User doesnt exist in authentication")

    if not auth_uid:
        register_response = requests.post(
            url,
            json={
                "email": register_request.email,
                "password": register_request.password,
                "returnSecureToken": True,
            },
            params={"key": firebase_client_config["apiKey"]},
        )
        if register_response.status_code != 200:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal Server Error"},
            )
        auth_uid = register_response.json()["localId"]

    del register_request.password
    if register_request.role == "patient":
        patient_data = {
            key: value
            for key, value in register_request.dict().items()
            if key not in ["birth_date", "sex", "blood_type"]
        }
        patient = Patient(**patient_data, id=auth_uid)
        patient.create()
        record_data = {
            key: value
            for key, value in register_request.dict().items()
            if key not in ["role", "email"]
        }
        record = Record(**record_data, id=auth_uid)
        record.create()
    else:
        physician = Physician(**register_request.dict(exclude_none=True), id=auth_uid)
        physician.create()
    return {"message": "Successfull registration"}


@router.get(
    "/role",
    status_code=status.HTTP_200_OK,
    response_model=UserRolesResponse,
    responses={
        401: {"model": UserProfileErrorResponse},
        403: {"model": UserProfileErrorResponse},
        500: {"model": UserProfileErrorResponse},
    },
)
def get_user_roles(user_id=Depends(Auth.is_logged_in)):
    """
    Get a users roles.

    This will return the users roles.

    This path operation will:

    * Return the users roles.
    * Throw an error if users role retrieving process fails.
    """
    roles = []
    try:
        if Admin.is_admin(user_id):
            roles.append("admin")
        if Patient.is_patient(user_id):
            roles.append("patient")
        if Physician.is_physician(user_id):
            roles.append("physician")
        return {"roles": roles}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/user-info",
    status_code=status.HTTP_200_OK,
    response_model=UserInfoResponse,
    responses={
        401: {"model": UserInfoErrorResponse},
        403: {"model": UserInfoErrorResponse},
        500: {"model": UserInfoErrorResponse},
    },
)
def get_user_info(user_id=Depends(Auth.is_logged_in)):
    """
    Get a user info.

    This will return the user info.

    This path operation will:

    * Return the user info.
    * Throw an error if user info retrieving process fails.
    """
    try:
        if Patient.get_by_id(user_id):
            return Patient.get_by_id(user_id)
        if Physician.get_by_id(user_id):
            return Physician.get_by_id(user_id)
        else:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
            )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
