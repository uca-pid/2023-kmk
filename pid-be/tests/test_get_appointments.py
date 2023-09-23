import pytest
import time
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "getApppointmentTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_user_information = {
    "display_name": "Second KMK Test User",
    "email": "getApppointmentSecondTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

other_KMK_user_information = {
    "display_name": "Third KMK Test User",
    "email": "getApppointmentThirdTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

a_valid_physician_id = "avalidphysicianid"
another_valid_physician_id = "anothervalidphysicianid"

db.collection("physicians").document(a_valid_physician_id).set(
    {"id": a_valid_physician_id, "first_name": "Doc", "last_name": "Docson"}
)
db.collection("physicians").document(another_valid_physician_id).set(
    {"id": another_valid_physician_id, "first_name": "Doctor", "last_name": "The Doc"}
)

an_appointment_data = {
    "physician_id": a_valid_physician_id,
    "date": round(time.time()) + 3600,
}

another_appointment_data = {
    "physician_id": another_valid_physician_id,
    "date": round(time.time()) + 3600,
}

other_appointment_data = {
    "physician_id": another_valid_physician_id,
    "date": round(time.time()) + 3600,
}

pytest.first_bearer = ""
pytest.second_bearer = ""
pytest.third_bearer = ""


@pytest.fixture(scope="session", autouse=True)
def create_test_user():
    first_created_user = auth.create_user(**a_KMK_user_information)
    second_created_user = auth.create_user(**another_KMK_user_information)
    third_created_user = auth.create_user(**other_KMK_user_information)
    a_KMK_user_information["uid"] = first_created_user.uid
    another_KMK_user_information["uid"] = second_created_user.uid
    other_KMK_user_information["uid"] = third_created_user.uid

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
    auth.delete_user(a_KMK_user_information["uid"])
    auth.delete_user(another_KMK_user_information["uid"])
    auth.delete_user(other_KMK_user_information["uid"])


def test_valid_request_to_get_endpoint_returns_200_code():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_get_endpoint.status_code == 200


def test_valid_request_to_get_endpoint_returns_a_list_of_two_elements_for_the_first_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 2


def test_valid_request_to_get_endpoint_returns_a_list_of_one_element_for_the_second_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 1


def test_valid_request_to_get_endpoint_returns_an_empty_list_for_the_second_user():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.third_bearer}"},
    )

    assert type(response_to_get_endpoint.json()["appointments"]) == list
    assert len(response_to_get_endpoint.json()["appointments"]) == 0


def test_valid_request_to_get_endpoint_returns_populated_appointment_objects():
    response_to_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    appointments = response_to_get_endpoint.json()["appointments"]

    if appointments[0]["id"] == an_appointment_data["id"]:
        first_appointment_to_validate = appointments[0]
        second_appointment_to_validate = appointments[1]
    else:
        first_appointment_to_validate = appointments[1]
        second_appointment_to_validate = appointments[0]

    assert first_appointment_to_validate["id"] == an_appointment_data["id"]
    assert first_appointment_to_validate["date"] == an_appointment_data["date"]
    assert first_appointment_to_validate.get("physician_id") == None
    assert first_appointment_to_validate.get("patient_id") == None
    assert first_appointment_to_validate["physician"] == {
        "id": a_valid_physician_id,
        "first_name": "Doc",
        "last_name": "Docson",
    }
    assert first_appointment_to_validate["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(first_appointment_to_validate["created_at"]) == int

    assert second_appointment_to_validate["id"] == another_appointment_data["id"]
    assert second_appointment_to_validate["date"] == another_appointment_data["date"]
    assert second_appointment_to_validate.get("physician_id") == None
    assert second_appointment_to_validate.get("patient_id") == None
    assert second_appointment_to_validate["physician"] == {
        "id": another_valid_physician_id,
        "first_name": "Doctor",
        "last_name": "The Doc",
    }
    assert second_appointment_to_validate["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(second_appointment_to_validate["created_at"]) == int


def test_get_single_appointment_returns_200_code_if_valid():
    response_from_single_appointment_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_from_single_appointment_endpoint.status_code == 200


def test_get_single_appointment_returns_appointment_object_if_valid():
    response_from_single_appointment_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    appointment = response_from_single_appointment_endpoint.json()
    assert appointment["id"] == an_appointment_data["id"]
    assert appointment["date"] == an_appointment_data["date"]
    assert appointment.get("physician_id") == None
    assert appointment.get("patient_id") == None
    assert appointment["physician"] == {
        "id": a_valid_physician_id,
        "first_name": "Doc",
        "last_name": "Docson",
    }
    assert appointment["patient"] == {
        "id": a_KMK_user_information["uid"],
        "first_name": "KMK",
        "last_name": "First",
    }
    assert type(appointment["created_at"]) == int


def test_get_appointments_with_no_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments"
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_empty_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": ""},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_empty_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_non_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": pytest.first_bearer},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointments_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointment_with_no_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}"
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointment_with_empty_authorization_header_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": ""},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointment_with_empty_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointment_with_non_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": pytest.first_bearer},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_appointment_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_get_endpoint.status_code == 401
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_unexistant_appointment_returns_400_code():
    response_to_appointment_get_endpoint = requests.get(
        "http://localhost:8080/appointments/invalidappointmentid",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_appointment_get_endpoint.status_code == 400
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "Invalid appointment id"
    )


def test_get_appointment_from_another_user_returns_400_code():
    response_to_appointment_get_endpoint = requests.get(
        f"http://localhost:8080/appointments/{other_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_appointment_get_endpoint.status_code == 400
    assert (
        response_to_appointment_get_endpoint.json()["detail"]
        == "Invalid appointment id"
    )
