import time
from datetime import datetime
from config import *
from firebase_admin import firestore

if __name__ == "__main__":
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
    number_of_day_of_week = today_date.isoweekday()

    a_KMK_user_information = {
        "display_name": "KMK Test User",
        "email": "getPhysiciansBySpecialtyTestUser@kmk.com",
        "email_verified": True,
        "password": "verySecurePassword123",
    }

    a_physician_information = {
        "id": "avalidid",
        "first_name": "Doc",
        "last_name": "Docson",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    another_physician_information = {
        "id": "anothervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    other_physician_information = {
        "id": "othervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Third",
        "specialty": specialties[1],
        "agenda": {
            str(number_of_day_of_week): {"start": 8, "finish": 18.5},
            str(number_of_day_of_week + 1): {"start": 7, "finish": 16},
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
