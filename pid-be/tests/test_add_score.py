import pytest
from datetime import datetime, timedelta
from firebase_admin import auth, firestore
from app.main import app
from fastapi.testclient import TestClient
import requests
from unittest.mock import patch
import time

client = TestClient(app)

db = firestore.client()

today_date = datetime.fromtimestamp(round(time.time()))
number_of_day_of_week = int(today_date.date().strftime("%w"))

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
    "first_name": "Physician Test User Register",
    "last_name": "Test Last Name",
    "tuition": "777777",
    "specialty": specialties[0],
    "email": "testphysicianforupdatingappointments@kmk.com",
    "password": "verySecurePassword123",
    "agenda": {str(number_of_day_of_week): {"start": 8.0, "finish": 18.5}},
}

a_KMK_patient_information = {
    "role": "patient",
    "first_name": "Patient Test User Register",
    "last_name": "Test Last Name",
    "email": "testpatientforupdatingappointments@kmk.com",
    "password": "verySecurePassword123",
    "birth_date": "9/1/2000",
    "gender": "m",
    "blood_type": "a",
}

@pytest.fixture(scope="module", autouse=True)
def create_patient_and_then_delete_him():
    created_user = auth.create_user(
        **{
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        }
    )
    pytest.patient_uid = created_user.uid
    db.collection("patients").document(pytest.patient_uid).set(
        a_KMK_patient_information
    )
    yield
    auth.delete_user(pytest.patient_uid)
    db.collection("patients").document(pytest.patient_uid).delete()

@pytest.fixture(scope="module", autouse=True)
def log_in_patient():
    pytest.bearer_token = client.post(
        "/users/login",
        json={
            "email": a_KMK_patient_information["email"],
            "password": a_KMK_patient_information["password"],
        },
    ).json()["token"]


@pytest.fixture(scope="module", autouse=True)
def create_physician_and_then_delete_him():
    created_user = auth.create_user(
        **{
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        }
    )
    pytest.physician_uid = created_user.uid
    db.collection("physicians").document(pytest.physician_uid).set(
        {**a_KMK_physician_information, "approved": "approved"}
    )
    yield
    try:
        auth.delete_user(pytest.physician_uid)
        db.collection("physicians").document(pytest.physician_uid).delete()
    except:
        print("[+] Physisican has not been created")


def test_endpoint_users_add_score():
    response = client.post(
        "/users/add-score",
        json={
            "physician_id": pytest.physician_uid,
            "puntuality": 2.6,
            "attention": 4,
            "cleanliness": 2,
            "facilities": 1,
            "price": 0.3,
        },
        headers={
            "Authorization": f"Bearer {pytest.bearer_token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Scores added successfully"
