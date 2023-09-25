import pytest
import requests
from .config import *
from firebase_admin import auth

a_KMK_physician_information = {
    "role": "physician",
    "name": "Physician Test User Register",
    "last_name": "Test Last Name",
    "matricula": "777777",
    "specialty": "cardiolgy",
    "email": "registerPhysicianTestUser@kmk.com",
    "password": "verySecurePassword123",
}

a_KMK_patient_information = {
    "role": "patient",
    "name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "registerPatientTestUser@kmk.com",
    "password": "verySecurePassword123",
}


@pytest.fixture(scope="session", autouse=True)
def test_Register_Physician_Returns_A_200_Code():
    response_to_register_physician_endpoint = requests.post(
        "http://localhost:8080/users/register-physician",
        json={
            "role": a_KMK_physician_information["role"],
            "name": a_KMK_physician_information["name"],
            "last_name": a_KMK_physician_information["last_name"],
            "matricula": a_KMK_physician_information["matricula"],
            "specialty": a_KMK_physician_information["specialty"],
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    )

    assert response_to_register_physician_endpoint.status_code == 200


def test_Register_Patient_Returns_A_200_Code():
    response_to_register_patient_endpoint = requests.post(
        "http://localhost:8080/users/register-patient",
        json={
            "role": a_KMK_patient_information["role"],
            "name": a_KMK_patient_information["name"],
            "last_name": a_KMK_patient_information["last_name"],
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    )

    assert response_to_register_patient_endpoint.status_code == 200
