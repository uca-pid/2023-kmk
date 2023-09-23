import pytest
import requests
import time
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

valid_physician_id = "validphysicianid"
db.collection("physicians").document(valid_physician_id).set({"first_name": "Doc"})

appointment_data = {
    "physician_id": valid_physician_id,
    "date": round(time.time()) + 3600,
}

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "postApppointmentTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def create_test_user():
    created_user = auth.create_user(**a_KMK_user_information)
    a_KMK_user_information["uid"] = created_user.uid
    yield
    auth.delete_user(a_KMK_user_information["uid"])


def test_creation_of_appointment_with_valid_data_returns_201_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_to_appointment_creation_endpoint.status_code == 201


def test_creation_of_apointment_with_valid_data_returns_the_id_of_the_created_appointment():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert (
        type(response_to_appointment_creation_endpoint.json()["appointment_id"]) == str
    )


def test_returned_id_is_the_id_of_the_created_appointment():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    appointment_id = response_to_appointment_creation_endpoint.json()["appointment_id"]

    created_appointment = db.collection("appointments").document(appointment_id).get()
    assert created_appointment.exists == True
    created_appointment = created_appointment.to_dict()
    assert created_appointment["date"] == appointment_data["date"]
    assert created_appointment["physician_id"] == appointment_data["physician_id"]
    assert created_appointment["id"] == appointment_id
    assert type(created_appointment["created_at"]) == int
    assert created_appointment["patient_id"] == a_KMK_user_information["uid"]


def test_invalid_date_format_in_appointment_creation_endpoint_returns_a_422_Code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json={"date": "tomorrow", "physician_id": appointment_data["physician_id"]},
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_to_appointment_creation_endpoint.status_code == 422


def test_past_date_in_appointment_creation_endpoint_returns_a_422_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json={"date": 0, "physician_id": appointment_data["physician_id"]},
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_to_appointment_creation_endpoint.status_code == 422


def test_invalid_physician_id_format_in_appointment_creation_endpoint_returns_a_422_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json={"date": appointment_data["date"], "physician_id": [1, 3, 5]},
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_to_appointment_creation_endpoint.status_code == 422


def test_creation_of_appointment_with_no_authorization_header_returns_401_code():
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments", json=appointment_data
    )

    assert response_to_appointment_creation_endpoint.status_code == 401
    assert (
        response_to_appointment_creation_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_creation_of_appointment_with_empty_authorization_header_returns_401_code():
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={"Authorization": ""},
    )

    assert response_to_appointment_creation_endpoint.status_code == 401
    assert (
        response_to_appointment_creation_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_creation_of_appointment_with_empty_bearer_token_returns_401_code():
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_creation_endpoint.status_code == 401
    assert (
        response_to_appointment_creation_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_creation_of_appointment_with_non_bearer_token_returns_401_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={"Authorization": response_from_login_endpoint.json()["token"]},
    )

    assert response_to_appointment_creation_endpoint.status_code == 401
    assert (
        response_to_appointment_creation_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_creation_of_appointment_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json=appointment_data,
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_creation_endpoint.status_code == 401
    assert (
        response_to_appointment_creation_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_creation_of_appointment_with_a_physician_id_that_doesnt_exists_returns_a_422_code():
    response_from_login_endpoint = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )
    response_to_appointment_creation_endpoint = requests.post(
        "http://localhost:8080/appointments",
        json={"date": appointment_data["date"], "physician_id": "invalidPhysicianId"},
        headers={
            "Authorization": f"Bearer {response_from_login_endpoint.json()['token']}"
        },
    )

    assert response_to_appointment_creation_endpoint.status_code == 422
