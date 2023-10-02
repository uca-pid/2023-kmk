import pytest
import time
from datetime import datetime, timedelta
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

today_date = datetime.fromtimestamp(round(time.time()))
number_of_day_of_week = int(today_date.date().strftime("%w"))
next_week_day = today_date + timedelta(days=7)
next_week_day_first_block = next_week_day.replace(hour=9)
next_week_day_second_block = next_week_day.replace(hour=10)
next_week_day_third_block = next_week_day.replace(hour=11)

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "deleteApppointmentTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_user_information = {
    "display_name": "Second KMK Test User",
    "email": "deleteApppointmentSecondTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

other_KMK_user_information = {
    "display_name": "Third KMK Test User",
    "email": "deleteApppointmentThirdTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

a_valid_physician_id = "avalidphysicianid"

another_valid_physician_id = "anothervalidphysicianid"

an_appointment_data = {
    "physician_id": a_valid_physician_id,
    "date": round(next_week_day_first_block.timestamp()),
}

another_appointment_data = {
    "physician_id": another_valid_physician_id,
    "date": round(next_week_day_second_block.timestamp()),
}

other_appointment_data = {
    "physician_id": another_valid_physician_id,
    "date": round(next_week_day_third_block.timestamp()),
}

pytest.first_bearer = ""
pytest.second_bearer = ""
pytest.third_bearer = ""


@pytest.fixture(scope="session", autouse=True)
def create_users():
    first_created_user = auth.create_user(**a_KMK_user_information)
    second_created_user = auth.create_user(**another_KMK_user_information)
    third_created_user = auth.create_user(**other_KMK_user_information)
    a_KMK_user_information["uid"] = first_created_user.uid
    another_KMK_user_information["uid"] = second_created_user.uid
    other_KMK_user_information["uid"] = third_created_user.uid
    yield
    auth.delete_user(a_KMK_user_information["uid"])
    auth.delete_user(another_KMK_user_information["uid"])
    auth.delete_user(other_KMK_user_information["uid"])


@pytest.fixture(autouse=True)
def create_physicians():
    db.collection("physicians").document(a_valid_physician_id).set(
        {
            "id": a_valid_physician_id,
            "first_name": "Doc",
            "last_name": "Docson",
            "specialty": "surgeon",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
        }
    )
    db.collection("physicians").document(another_valid_physician_id).set(
        {
            "id": another_valid_physician_id,
            "first_name": "Doctor",
            "last_name": "The Doc",
            "specialty": "surgeon",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
        }
    )
    yield
    db.collection("physicians").document(a_valid_physician_id).delete()
    db.collection("physicians").document(another_valid_physician_id).delete()


@pytest.fixture(autouse=True)
def create_test_environment():
    db.collection("patients").document(a_KMK_user_information["uid"]).set(
        {"id": a_KMK_user_information["uid"], "first_name": "KMK", "last_name": "First"}
    )
    db.collection("patients").document(another_KMK_user_information["uid"]).set(
        {
            "id": another_KMK_user_information["uid"],
            "first_name": "KMK",
            "last_name": "Second",
        }
    )
    db.collection("patients").document(other_KMK_user_information["uid"]).set(
        {
            "id": other_KMK_user_information["uid"],
            "first_name": "KMK",
            "last_name": "Third",
        }
    )

    response_from_login_endpoint_for_first_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    pytest.first_bearer = response_from_login_endpoint_for_first_user.json()["token"]

    response_from_login_endpoint_for_second_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_user_information["email"],
            "password": another_KMK_user_information["password"],
        },
    )

    pytest.second_bearer = response_from_login_endpoint_for_second_user.json()["token"]

    response_from_login_endpoint_for_third_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": other_KMK_user_information["email"],
            "password": other_KMK_user_information["password"],
        },
    )

    pytest.third_bearer = response_from_login_endpoint_for_third_user.json()["token"]

    first_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=an_appointment_data,
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    print(first_appointment_creation_response.json())

    an_appointment_data["id"] = first_appointment_creation_response.json()[
        "appointment_id"
    ]

    second_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=another_appointment_data,
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    another_appointment_data["id"] = second_appointment_creation_response.json()[
        "appointment_id"
    ]

    third_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json=other_appointment_data,
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    other_appointment_data["id"] = third_appointment_creation_response.json()[
        "appointment_id"
    ]
    yield


def test_delete_appointment_of_a_valid_appointment_returns_a_200_code():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 200


def test_delete_appointment_of_a_valid_appointment_returns_a_message_indicating_successful_deletion():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert (
        response_to_delete_endpoint.json()["message"]
        == "Appointment cancelled successfully"
    )


def test_delete_appointment_of_a_valid_appointment_removes_appointment_from_firestore():
    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == True
    )

    requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == False
    )


def test_delete_appointment_with_no_authorization_header_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}"
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_empty_authorization_header_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": ""},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_empty_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_non_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": pytest.first_bearer},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_of_another_users_appointment_returns_a_400_code_and_message():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 400
    assert response_to_delete_endpoint.json()["detail"] == "Invalid appointment id"


def test_delete_appointment_appointment_that_doent_exist_returns_a_400_code_and_message():
    response_to_delete_endpoint = requests.delete(
        "http://localhost:8080/appointments/invalidapointmentid",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 400
    assert response_to_delete_endpoint.json()["detail"] == "Invalid appointment id"
