import pytest
import requests
import os
from dotenv import load_dotenv
from firebase_admin import auth, credentials, initialize_app

load_dotenv()

credentialsToUse = credentials.Certificate(
    {
        "type": "service_account",
        "project_id": os.environ.get("PROJECT_ID"),
        "private_key_id": os.environ.get("PRIVATE_KEY_ID"),
        "private_key": os.environ.get("PRIVATE_KEY"),
        "client_email": os.environ.get("CLIENT_EMAIL"),
        "client_id": os.environ.get("CLIENT_ID"),
        "auth_uri": os.environ.get("AUTH_URI"),
        "token_uri": os.environ.get("TOKEN_URI"),
        "auth_provider_x509_cert_url": os.environ.get("AUTH_PROVIDER_X509_CERT_URL"),
        "client_x509_cert_url": os.environ.get("CLIENT_X509_CERT_URL"),
        "universe_domain": os.environ.get("UNIVERSE_DOMAIN"),
    }
)
initialize_app(credentialsToUse)

appointmentData = {"physician": "smth", "date": 1695165134000}


def testCreationOfAppointmentWithValidDataReturns201Code():
    responseToAppointmentCreationEndpoint = requests.post(
        "http://localhost:8080/appointments", json=appointmentData
    )

    assert responseToAppointmentCreationEndpoint.status_code == 201
