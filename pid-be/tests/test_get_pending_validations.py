import pytest
from datetime import datetime, timedelta
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

@pytest.fixture(scope="session", autouse=True)
def test_Get_Pending_Validations_Returns_A_200_Code():
    response_to_get_pending_validations_endpoint = requests.get(
        "http://localhost:8080/admins/pending-validations"
    )

    assert response_to_get_pending_validations_endpoint.status_code == 200