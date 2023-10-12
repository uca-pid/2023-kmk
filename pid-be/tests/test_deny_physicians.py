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
    "email": "testphysicianfordenial@kmk.com",
    "password": "verySecurePassword123",
}

another_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register 2",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianfordenial2@kmk.com",
    "password": "verySecurePassword123",
}

a_KMK_patient_information = {
    "role": "patient",
    "name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "testpatientfordenial@kmk.com",
    "password": "verySecurePassword123",
}

initial_admin_information = {
    "email": "testinitialadminfordenial@kmk.com",
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def load_and_delete_specialties():
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
    pytest.a_patient_uid = auth.get_user_by_email(
        a_KMK_patient_information["email"]
    ).uid
    yield
    auth.delete_user(pytest.a_patient_uid)
    db.collection("patients").document(pytest.a_patient_uid).delete()


@pytest.fixture(autouse=True)
def create_a_physician_and_then_delete_him():
    requests.post(
        "http://localhost:8080/users/register",
        json=a_KMK_physician_information,
    )
    pytest.a_physician_uid = auth.get_user_by_email(
        a_KMK_physician_information["email"]
    ).uid
    yield
    try:
        auth.delete_user(pytest.a_physician_uid)
        db.collection("physicians").document(pytest.a_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(autouse=True)
def create_another_physician_and_then_delete_him():
    requests.post(
        "http://localhost:8080/users/register",
        json=another_KMK_physician_information,
    )
    pytest.another_physician_uid = auth.get_user_by_email(
        another_KMK_physician_information["email"]
    ).uid
    yield
    try:
        auth.delete_user(pytest.another_physician_uid)
        db.collection("physicians").document(pytest.another_physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


@pytest.fixture(scope="session", autouse=True)
def create_initial_admin_and_then_delete_him(
    create_patient_and_then_delete_him,
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


def test_deny_physician_endpoint_returns_a_200_code():
    response_from_deny_phician_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert response_from_deny_phician_endpoint.status_code == 200


def test_deny_physician_endpoint_returns_message():
    response_from_deny_phician_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert (
        response_from_deny_phician_endpoint.json()["message"]
        == "Physician denied successfully"
    )


# def test_deny_physician_endpoint_updates_approved_field_in_firestore():
#     assert (
#         db.collection("physicians")
#         .document(pytest.a_physician_uid)
#         .get()
#         .to_dict()["approved"]
#         == "pending"
#     )
#     requests.post(
#         f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
#         headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
#     )

#     assert (
#         db.collection("physicians")
#         .document(pytest.a_physician_uid)
#         .get()
#         .to_dict()["approved"]
#         == "denied"
#     )


def test_deny_physician_endpoint_updates_firestore_collections():
    # Verifica que el médico esté inicialmente en la colección "physicians" con el estado "pending"
    physician_ref = db.collection("physicians").document(pytest.a_physician_uid)
    physician_data = physician_ref.get().to_dict()
    assert physician_data is not None
    assert physician_data["approved"] == "pending"

    # Realiza la solicitud para denegar al médico
    requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    # Verifica que el médico ya no esté en la colección "physicians" y su estado sea "denied"
    physician_data = physician_ref.get().to_dict()
    assert physician_data is None

    # Verifica que el médico haya sido agregado a la colección "deniedPhysicians"
    denied_physician_ref = db.collection("deniedPhysicians").document(
        pytest.a_physician_uid
    )
    denied_physician_data = denied_physician_ref.get().to_dict()
    assert denied_physician_data is not None
    assert denied_physician_data["approved"] == "denied"


def test_deny_physician_endpoint_for_a_non_physician_returns_a_400_code_and_message():
    response_from_deny_phician_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_patient_uid}",
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )

    assert response_from_deny_phician_endpoint.status_code == 400
    assert (
        response_from_deny_phician_endpoint.json()["detail"]
        == "Can only deny physicians"
    )


def test_deny_physician_with_no_authorization_header_returns_401_code():
    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}"
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_deny_physician_with_empty_authorization_header_returns_401_code():
    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": ""},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_deny_physician_with_empty_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": f"Bearer "},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_deny_physician_with_non_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": pytest.initial_admin_bearer},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_deny_physician_with_invalid_bearer_token_returns_401_code():
    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_from_admin_registration_endpoint.status_code == 401
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_deny_physician_by_non_admin_returns_403_code_and_message():
    non_admin_bearer = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    ).json()["token"]

    response_from_admin_registration_endpoint = requests.post(
        f"http://localhost:8080/admin/deny-physician/{pytest.a_physician_uid}",
        headers={"Authorization": f"Bearer {non_admin_bearer}"},
    )

    assert response_from_admin_registration_endpoint.status_code == 403
    assert (
        response_from_admin_registration_endpoint.json()["detail"]
        == "User must be an admin"
    )
