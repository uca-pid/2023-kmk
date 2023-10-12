import pytest
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

a_KMK_patient_information = {
    "role": "patient",
    "name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "testpatientforisloggedin@kmk.com",
    "password": "verySecurePassword123",
    "birth_date": "9/1/2000",
    "gender": "m",
    "blood_type": "a",
}


@pytest.fixture(scope="session", autouse=True)
def clean_firestore():
    requests.delete(
        "http://localhost:8081/emulator/v1/projects/pid-kmk/databases/(default)/documents"
    )


@pytest.fixture(autouse=True)
def create_patient_and_then_delete_him(clean_firestore):
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_patient_information,
    )
    pytest.patient_uid = auth.get_user_by_email(a_KMK_patient_information["email"]).uid
    yield
    auth.delete_user(pytest.patient_uid)
    db.collection("patients").document(pytest.patient_uid).delete()


@pytest.fixture(autouse=True)
def log_in_patient(create_patient_and_then_delete_him):
    pytest.bearer_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    ).json()["token"]
    yield


def test_change_password_endpoint_returns_a_200_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "newPassword123456",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    assert response_from_change_password_endpoint.status_code == 200


def test_change_password_endpoint_returns_a_message():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "newPassword123456",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    assert (
        response_from_change_password_endpoint.json()["message"]
        == "Password changed successfully"
    )


def test_change_password_endpoint_changes_password_in_authentication():
    new_password = "newPassword123456"
    assert (
        requests.post(
            "http://localhost:8080/users/login",
            json={
                "email": a_KMK_patient_information["email"],
                "password": new_password,
            },
        ).status_code
        == 400
    )

    requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": new_password,
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    assert (
        requests.post(
            "http://localhost:8080/users/login",
            json={
                "email": a_KMK_patient_information["email"],
                "password": new_password,
            },
        ).status_code
        == 200
    )


def test_change_password_endpoint_throws_a_422_if_new_password_has_less_that_8_characters():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "nePa6",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    response_from_change_password_endpoint.status_code == 422


def test_change_password_endpoint_throws_a_422_if_new_password_has_no_uppercases():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "password123456",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    response_from_change_password_endpoint.status_code == 422


def test_change_password_endpoint_throws_a_422_if_new_password_has_no_lowercases():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "PASSWORD123456",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    response_from_change_password_endpoint.status_code == 422


def test_change_password_endpoint_throws_a_422_if_new_password_has_no_numbers():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": a_KMK_patient_information["password"],
            "new_password": "PASSWORDabc",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    response_from_change_password_endpoint.status_code == 422


def test_change_password_with_no_authorization_header_returns_401_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password"
    )

    assert response_from_change_password_endpoint.status_code == 401
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_change_password_with_empty_authorization_header_returns_401_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        headers={"Authorization": ""},
    )

    assert response_from_change_password_endpoint.status_code == 401
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_change_password_with_empty_bearer_token_returns_401_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        headers={"Authorization": f"Bearer "},
    )

    assert response_from_change_password_endpoint.status_code == 401
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_change_password_with_non_bearer_token_returns_401_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        headers={"Authorization": pytest.bearer_token},
    )

    assert response_from_change_password_endpoint.status_code == 401
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_change_password_with_invalid_bearer_token_returns_401_code():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_from_change_password_endpoint.status_code == 401
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_change_password_endpoint_returns_a_400_code_and_message_if_current_password_is_invalid():
    response_from_change_password_endpoint = requests.post(
        "http://localhost:8080/users/change-password",
        json={
            "current_password": "notCurrentPassword",
            "new_password": "newPassword123456",
        },
        headers={"Authorization": f"Bearer {pytest.bearer_token}"},
    )

    assert response_from_change_password_endpoint.status_code == 400
    assert (
        response_from_change_password_endpoint.json()["detail"]
        == "Invalid current password"
    )
