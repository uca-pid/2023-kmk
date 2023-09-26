import requests
import json
import os
from dotenv import load_dotenv

from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.requests.UserRequests import (
    UserLoginRequest,
    PhysicianRegisterRequest,
    PatientRegisterRequest,
)
from app.models.responses.UserResponses import (
    SuccessfulLoginResponse,
    LoginErrorResponse,
    SuccessfullRegisterResponse,
    RegisterErrorResponse,
)

from app.models.entities.Auth import Auth
from app.models.entities.Patient import Patient
from app.models.entities.Physician import Physician

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
        401: {"model": LoginErrorResponse},
        500: {"model": LoginErrorResponse},
    },
)
async def login_user(
    user_login_request: UserLoginRequest, token=Depends(Auth.has_bearer_token)
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
    "/register-physician",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullRegisterResponse,
    responses={
        400: {"model": RegisterErrorResponse},
        401: {"model": RegisterErrorResponse},
        500: {"model": RegisterErrorResponse},
    },
)
async def register_physician(physicianRegisterRequest: PhysicianRegisterRequest):
    """
    Register a user.
    This will allow users to register on the platform.
    This path operation will:
    * Register users, performing validations on data received and on its validity.
    * Throw an error if registration fails.
    """

    url = os.environ.get("REGISTER_URL")
    registerResponse = requests.post(
        url,
        json={
            "email": physicianRegisterRequest.email,
            "password": physicianRegisterRequest.password,
            "returnSecureToken": True,
        },
        params={"key": firebase_client_config["apiKey"]},
    )

    if registerResponse.status_code == 400:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid email and/or password"},
        )
    elif registerResponse.status_code == 200:
        # Obtenemos el uid de autenticación de Firebase
        auth_uid = registerResponse.json()["localId"]
        # Usamos el mismo uid como identificador en la base de datos
        physician = Physician(
            **physicianRegisterRequest.dict(), id=auth_uid, approved="pending"
        )
        physician.create()
        return {"message": "Successfull registration"}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )


@router.post(
    "/register-patient",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfullRegisterResponse,
    responses={
        400: {"model": RegisterErrorResponse},
        401: {"model": RegisterErrorResponse},
        500: {"model": RegisterErrorResponse},
    },
)
async def register_patient(patientRegisterRequest: PatientRegisterRequest):
    """
    Register a user.
    This will allow users to register on the platform.
    This path operation will:
    * Register users, performing validations on data received and on its validity.
    * Throw an error if registration fails.
    """

    url = os.environ.get("REGISTER_URL")
    registerResponse = requests.post(
        url,
        json={
            "email": patientRegisterRequest.email,
            "password": patientRegisterRequest.password,
            "returnSecureToken": True,
        },
        params={"key": firebase_client_config["apiKey"]},
    )

    if registerResponse.status_code == 400:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid email and/or password"},
        )
    elif registerResponse.status_code == 200:
        # Obtenemos el uid de autenticación de Firebase
        auth_uid = registerResponse.json()["localId"]
        # Usamos el mismo uid como identificador en la base de datos
        patient = Patient(**patientRegisterRequest.dict(), id=auth_uid)
        patient.create()
        return {"message": "Successfull registration"}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )
