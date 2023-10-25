import pytest
import requests
from .config import *
from firebase_admin import auth

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "loginTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def clean_firestore():
    requests.delete(
        "http://localhost:8081/emulator/v1/projects/pid-kmk/databases/(default)/documents"
    )


@pytest.fixture(scope="session", autouse=True)
def create_test_user(clean_firestore):
    created_user = auth.create_user(**a_KMK_user_information)
    a_KMK_user_information["uid"] = created_user.uid
    yield
    auth.delete_user(a_KMK_user_information["uid"])


def test_Login_With_Valid_Credentials_Returns_A_200_Code():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    assert response_to_login_endpoint.status_code == 200


def test_Login_With_Valid_Credentials_Returns_A_Token():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    assert response_to_login_endpoint.json().get("token") != None
    assert type(response_to_login_endpoint.json()["token"]) == str


def test_Returned_Bearer_Is_Valid():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    bearer = response_to_login_endpoint.json()["token"]
    assert type(auth.verify_id_token(bearer)) == dict


def test_Login_With_Invalid_Email_Credential_Returns_A_400_Code_And_Message():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": "invalid@email.com",
            "password": a_KMK_user_information["password"],
        },
    )

    assert response_to_login_endpoint.status_code == 400
    assert (
        response_to_login_endpoint.json()["detail"] == "Invalid email and/or password"
    )


def test_Login_With_Invalid_Password_Credential_Returns_A_400_Code_And_Message():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={"email": a_KMK_user_information["email"], "password": "invalidPassword"},
    )

    assert response_to_login_endpoint.status_code == 400
    assert (
        response_to_login_endpoint.json()["detail"] == "Invalid email and/or password"
    )


def test_Invalid_Email_Format_For_Login_Returns_A_422_Code():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={"email": "invalidEmail@format", "password": "aPassword"},
    )

    assert response_to_login_endpoint.status_code == 422


def test_Loggin_Endpoint_Returns_A_403_Code_And_Message_If_User_Is_Logged_In():
    response_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    bearer = response_to_login_endpoint.json()["token"]

    response_to_second_request_to_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        headers={"Authorization": f"Bearer {bearer}"},
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    assert response_to_second_request_to_login_endpoint.status_code == 403
    assert (
        response_to_second_request_to_login_endpoint.json()["detail"]
        == "User has already logged in"
    )
