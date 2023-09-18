import requests
import json
import os
from dotenv import load_dotenv

from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.requests.UserRequests import UserLoginRequest
from app.models.responses.UserResponses import (
    SuccessfulLoginResponse,
    LoginErrorResponse,
)

from app.models.entities.Auth import Auth

load_dotenv()

router = APIRouter(
    prefix="/users", tags=["Users"], responses={404: {"description": "Not found"}}
)

with open("credentials/client.json") as fp:
    firebaseClientConfig = json.loads(fp.read())


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
    userLoginRequest: UserLoginRequest, token=Depends(Auth.has_bearer_token)
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
    loginResponse = requests.post(
        url,
        json={
            "email": userLoginRequest.email,
            "password": userLoginRequest.password,
            "return_secure_token": True,
        },
        params={"key": firebaseClientConfig["apiKey"]},
    )
    if loginResponse.status_code == 400:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Invalid email and/or password"},
        )
    elif loginResponse.status_code == 200:
        return {"token": loginResponse.json()["idToken"]}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )
