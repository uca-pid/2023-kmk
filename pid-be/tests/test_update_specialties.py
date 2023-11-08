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

initial_admin_information = {
    "email": "testinitialadminfordenial@kmk.com",
    "password": "verySecurePassword123",
}

@pytest.fixture(scope="module", autouse=True)
def load_and_delete_specialties():
    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
    yield
    specilaties_doc = db.collection("specialties").list_documents()
    for specialty_doc in specilaties_doc:
        specialty_doc.delete()

@pytest.fixture(scope="module", autouse=True)
def create_initial_admin_and_then_delete_him():
    pytest.initial_admin_uid = auth.create_user(**initial_admin_information).uid
    db.collection("superusers").document(pytest.initial_admin_uid).set(
        initial_admin_information
    )
    yield
    auth.delete_user(pytest.initial_admin_uid)
    db.collection("superusers").document(pytest.initial_admin_uid).delete()

@pytest.fixture(scope="module", autouse=True)
def log_in_initial_admin_user(create_initial_admin_and_then_delete_him):
    pytest.initial_admin_bearer = client.post(
        "/users/login",
        json={
            "email": initial_admin_information["email"],
            "password": initial_admin_information["password"],
        },
    ).json()["token"]
    yield

def test_add_specialty_updates_document_in_firestore():
    specialties_before_update = ( db.collection("specialties").get().to_dict())
    pytest.initial_admin_bearer = client.post(
        "/specialties/add",
        json={
            "name": "aNewSpecialty",
        },
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )
    specialties_after_update = ( db.collection("specialties").get().to_dict())
    assert len(specialties_before_update) + 1 == len(specialties_after_update)
    assert "aNewSpecialty" in specialties_after_update

def test_delete_specialty_updates_document_in_firestore():
    specialties_before_update = ( db.collection("specialties").get().to_dict())
    pytest.initial_admin_bearer = client.post(
        "/specialties/delete",
        json={
            "specialty_id": pytest.specialty_id,
        },
        headers={"Authorization": f"Bearer {pytest.initial_admin_bearer}"},
    )
    specialties_after_update = ( db.collection("specialties").get().to_dict())
    assert len(specialties_before_update) - 1 == len(specialties_after_update)
    assert specialties_before_update[pytest.specialty_id] not in specialties_after_update