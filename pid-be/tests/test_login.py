import pytest
import requests
import os
from firebase_admin import auth, credentials, initialize_app

os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"

credentialsToUse = credentials.Certificate("./credentials/credentials.json")
initialize_app(credentialsToUse)

aKMKUserInformation = {
    "display_name": "KMK Test User",
    "email": "testUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def createTestUser():
    createdUser = auth.create_user(**aKMKUserInformation)
    aKMKUserInformation["uid"] = createdUser.uid
    yield
    auth.delete_user(aKMKUserInformation["uid"])


def testLoginWithValidCredentialsReturnsA200Code():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": aKMKUserInformation["email"],
            "password": aKMKUserInformation["password"],
        },
    )

    assert responseToLoginEndpoint.status_code == 200


def testLoginWithValidCredentialsReturnsAToken():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": aKMKUserInformation["email"],
            "password": aKMKUserInformation["password"],
        },
    )

    assert responseToLoginEndpoint.json().get("token") != None
    assert type(responseToLoginEndpoint.json()["token"]) == str


def testReturnedBearerIsValid():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": aKMKUserInformation["email"],
            "password": aKMKUserInformation["password"],
        },
    )

    bearer = responseToLoginEndpoint.json()["token"]
    print(bearer)
    assert type(auth.verify_id_token(bearer)) == dict


def testLoginWithInvalidEmailCredentialReturnsA400CodeAndMessage():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": "invalid@email.com",
            "password": aKMKUserInformation["password"],
        },
    )

    assert responseToLoginEndpoint.status_code == 400
    assert responseToLoginEndpoint.json()["detail"] == "Invalid email and/or password"


def testLoginWithInvalidPasswordCredentialReturnsA400CodeAndMessage():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={"email": aKMKUserInformation["email"], "password": "invalidPassword"},
    )

    assert responseToLoginEndpoint.status_code == 400
    assert responseToLoginEndpoint.json()["detail"] == "Invalid email and/or password"


def testInvalidEmailFormatForLoginReturnsA422Code():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={"email": "invalidEmail@format", "password": "aPassword"},
    )

    assert responseToLoginEndpoint.status_code == 422


def testLogginEndpointReturnsA401CodeAndMessageIfUserIsLoggedIn():
    responseToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": aKMKUserInformation["email"],
            "password": aKMKUserInformation["password"],
        },
    )

    bearer = responseToLoginEndpoint.json()["token"]

    responseToSecondRequestToLoginEndpoint = requests.post(
        "http://localhost:8080/users/login",
        headers={"Authorization": f"Bearer {bearer}"},
        json={
            "email": aKMKUserInformation["email"],
            "password": aKMKUserInformation["password"],
        },
    )

    assert responseToSecondRequestToLoginEndpoint.status_code == 401
    assert (
        responseToSecondRequestToLoginEndpoint.json()["detail"]
        == "User has already logged in"
    )
