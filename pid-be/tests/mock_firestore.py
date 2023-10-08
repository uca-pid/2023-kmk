import time
from datetime import datetime
from config import *
from firebase_admin import firestore

if __name__ == "__main__":
    db = firestore.client()

    specialties = [
        "Cardiologia",
        "Dermatologia",
        "Endocrinologia",
        "Gastroenterologia",
        "Geriatria",
        "Ginecologia",
        "Hematologia",
        "Infectologia",
        "Nefrologia",
        "Neurologia",
        "Oftalmologia",
        "Oncologia",
        "Ortopedia",
        "Otorrinolaringologia",
        "Pediatria",
        "Pneumologia",
        "Psiquiatria",
        "Reumatologia",
        "Urologia",
    ]

    today_date = datetime.now().date()
    number_of_day_of_week = int(today_date.strftime("%w"))

    a_KMK_user_information = {
        "display_name": "KMK Test User",
        "email": "getPhysiciansBySpecialtyTestUser@kmk.com",
        "email_verified": True,
        "password": "verySecurePassword123",
    }

    a_physician_information = {
        "approved": "Approved",
        "id": "avalidid",
        "first_name": "Doc",
        "last_name": "Docson",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    another_physician_information = {
        "approved": "Approved",
        "id": "anothervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    other_physician_information = {
        "approved": "Approved",
        "id": "othervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Third",
        "specialty": specialties[1],
        "agenda": {
            str(number_of_day_of_week): {"start": 8, "finish": 18.5},
            str((number_of_day_of_week + 1) % 7): {"start": 7, "finish": 16},
        },
    }

    db.collection("physicians").document(a_physician_information["id"]).set(
        a_physician_information
    )
    db.collection("physicians").document(another_physician_information["id"]).set(
        another_physician_information
    )
    db.collection("physicians").document(other_physician_information["id"]).set(
        other_physician_information
    )

    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
