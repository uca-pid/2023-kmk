import pytest
import time
from datetime import datetime
from firebase_admin import firestore, auth
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

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

today_date = datetime.fromtimestamp(round(time.time()))
number_of_day_of_week = int(today_date.date().strftime("%w"))

a_physician_information = {
    "id": "avalidid",
    "first_name": "Doc",
    "last_name": "Docson",
    "email": "doctor@getbyspecialty.com",
    "specialty": specialties[0],
    "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    "approved": "approved",
    "tuition": "A111",
}


@pytest.fixture(scope="module", autouse=True)
def load_and_delete_physicians():
    created_user = auth.create_user(
        **{"email": a_physician_information["email"], "password": "verystrongpassword"}
    )
    pytest.physician_id = created_user.uid
    db.collection("physicians").document(pytest.physician_id).set(
        a_physician_information
    )

    yield
    auth.delete_user(pytest.physician_id)
    db.collection("physicians").document(pytest.physician_id).delete()


@pytest.fixture(scope="module", autouse=True)
def log_in_physician(load_and_delete_physicians):
    pytest.physician_bearer_token = client.post(
        "/users/login",
        json={
            "email": a_physician_information["email"],
            "password": "verystrongpassword",
        },
    ).json()["token"]
    yield


def test_request_to_physician_schedule_update_endpoint_returns_200_code():
    response_from_physician_schedule_update_endpoint = client.put(
        "/physicians/agenda",
        headers={"Authorization": f"Bearer {pytest.physician_bearer_token}"},
        json={
            str(number_of_day_of_week): {"start": 8, "finish": 19.5},
            str((number_of_day_of_week + 1) % 7): {"start": 8, "finish": 9},
        },
    )

    assert response_from_physician_schedule_update_endpoint.status_code == 200
