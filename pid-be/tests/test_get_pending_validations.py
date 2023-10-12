import pytest
import requests
from .config import *
from firebase_admin import firestore, auth

db = firestore.client()

specialties = [
    "pediatrics",
    "dermatology",
    "gastroenterology",
    "radiology",
    "urology",
    "ophtalmology",
    "endocrynology",
    "neurology",
    "cardiology",
    "family medicine",
    "psychiatry",
]

a_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register 1",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianforpendingvalidations@kmk.com",
    "password": "verySecurePassword123",
}

another_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register 2",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianforpendingvalidations2@kmk.com",
    "password": "verySecurePassword123",
}

other_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register 3",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianforpendingvalidations3@kmk.com",
    "password": "verySecurePassword123",
}

a_KMK_patient_information = {
    "role": "patient",
    "name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "testpatientforpendingvalidations@kmk.com",
    "password": "verySecurePassword123",
    "birth_date": "9/1/2000",
    "gender": "m",
    "blood_type": "a",
}

initial_admin_information = {
    "email": "testinitialadminforpendingvalidations@kmk.com",
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def clean_firestore():
    os.system("firebase firestore:delete --all-collections -y")


@pytest.fixture(scope="session", autouse=True)
def load_and_delete_specialties(clean_firestore):
    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
    yield
    specilaties_doc = db.collection("specialties").list_documents()
    for specialty_doc in specilaties_doc:
        specialty_doc.delete()


@pytest.fixture(scope="session", autouse=True)
def create_patient_and_then_delete_him(load_and_delete_specialties):
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_patient_information,
    )
    yield
    created_test_patient_uid = auth.get_user_by_email(
        a_KMK_patient_information["email"]
    ).uid
    auth.delete_user(created_test_patient_uid)
    db.collection("patients").document(created_test_patient_uid).delete()


@pytest.fixture(scope="session", autouse=True)
def create_validated_physician_and_then_delete_him(create_patient_and_then_delete_him):
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_physician_information,
    )
    created_test_physician_uid = auth.get_user_by_email(
        a_KMK_physician_information["email"]
    ).uid
    db.collection("physicians").document(created_test_physician_uid).update(
        {"approved": "approved"}
    )
    yield
    try:
        created_test_physician_uid = auth.get_user_by_email(
            a_KMK_physician_information["email"]
        ).uid
        auth.delete_user(created_test_physician_uid)
        db.collection("physicians").document(created_test_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(scope="session", autouse=True)
def create_denied_physician_and_then_delete_him(
    create_validated_physician_and_then_delete_him,
):
    requests.post(
        "http://localhost:8080/users/register",
        json=another_KMK_physician_information,
    )
    created_test_physician_uid = auth.get_user_by_email(
        another_KMK_physician_information["email"]
    ).uid
    db.collection("physicians").document(created_test_physician_uid).update(
        {"approved": "denied"}
    )
    yield
    try:
        created_test_physician_uid = auth.get_user_by_email(
            another_KMK_physician_information["email"]
        ).uid
        auth.delete_user(created_test_physician_uid)
        db.collection("physicians").document(created_test_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(scope="session", autouse=True)
def create_pending_physician_and_then_delete_him(
    create_denied_physician_and_then_delete_him,
):
    requests.post(
        "http://localhost:8080/users/register",
        json=other_KMK_physician_information,
    )
    yield
    try:
        created_test_physician_uid = auth.get_user_by_email(
            other_KMK_physician_information["email"]
        ).uid
        auth.delete_user(created_test_physician_uid)
        db.collection("physicians").document(created_test_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(scope="session", autouse=True)
def create_initial_admin_and_then_delete_him(
    create_pending_physician_and_then_delete_him,
):
    pytest.initial_admin_uid = auth.create_user(**initial_admin_information).uid
    db.collection("superusers").document(pytest.initial_admin_uid).set(
        initial_admin_information
    )
    yield
    auth.delete_user(pytest.initial_admin_uid)
    db.collection("superusers").document(pytest.initial_admin_uid).delete()


@pytest.fixture(scope="session", autouse=True)
def log_in_initial_admin_user(create_initial_admin_and_then_delete_him):
    pytest.initial_admin_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": initial_admin_information["email"],
            "password": initial_admin_information["password"],
        },
    ).json()["token"]
    yield


def test_get_pending_validations_returns_a_200_code():
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert response_to_get_pending_validations_endpoint.status_code == 200


def test_get_pending_validations_returns_a_list():
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert (
        type(
            response_to_get_pending_validations_endpoint.json()[
                "physicians_pending_validation"
            ]
        )
        == list
    )


def test_get_pending_validations_returns_a_list_of_one_element():
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert (
        len(
            response_to_get_pending_validations_endpoint.json()[
                "physicians_pending_validation"
            ]
        )
        == 1
    )


def test_get_pending_validations_returns_a_list_of_a_populated_physician():
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    physician_to_validate = response_to_get_pending_validations_endpoint.json()[
        "physicians_pending_validation"
    ][0]

    assert type(physician_to_validate["id"]) == str
    assert (
        physician_to_validate["first_name"] == other_KMK_physician_information["name"]
    )
    assert (
        physician_to_validate["last_name"]
        == other_KMK_physician_information["last_name"]
    )
    assert (
        physician_to_validate["specialty"]
        == other_KMK_physician_information["specialty"]
    )
    physician_to_validate["agenda"]["working_days"] = set(
        physician_to_validate["agenda"]["working_days"]
    )
    physician_to_validate["agenda"]["working_hours"].sort(
        key=lambda x: x["day_of_week"]
    )
    assert physician_to_validate["agenda"] == {
        "working_days": {1, 2, 3, 4, 5},
        "working_hours": [
            {
                "day_of_week": 1,
                "start_time": 8,
                "finish_time": 18,
            },
            {
                "day_of_week": 2,
                "start_time": 8,
                "finish_time": 18,
            },
            {
                "day_of_week": 3,
                "start_time": 8,
                "finish_time": 18,
            },
            {
                "day_of_week": 4,
                "start_time": 8,
                "finish_time": 18,
            },
            {
                "day_of_week": 5,
                "start_time": 8,
                "finish_time": 18,
            },
        ],
        "appointments": [],
    }


def test_get_pending_validations_with_no_authorization_header_returns_401_code():
    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_pending_validations_with_empty_authorization_header_returns_401_code():
    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": ""},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_pending_validations_with_empty_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer "},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_pending_validations_with_non_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": pytest.initial_admin_bearer},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_pending_validations_with_invalid_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_get_pending_validations_by_non_admin_returns_403_code_and_message():
    non_admin_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    ).json()["token"]

    response_from_admin_registration_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {non_admin_bearer}"},
    )

    assert response_from_admin_registration_endpoint.status_code == 403
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be an admin"
    )


def test_get_pending_validations_if_none_exists_returns_an_empty_list():
    created_test_physician_uid = auth.get_user_by_email(
        other_KMK_physician_information["email"]
    ).uid
    db.collection("physicians").document(created_test_physician_uid).update(
        {"approved": "approved"}
    )
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admin/pending-validations",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert (
        response_to_get_pending_validations_endpoint.json()[
            "physicians_pending_validation"
        ]
        == []
    )
