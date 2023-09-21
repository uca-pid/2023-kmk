import time
from firebase_admin import firestore

db = firestore.client()


class Appointment:
    date: int
    physician_id: str
    patient: str

    def __init__(self, date: int, physician_id: str, patient: str):
        self.date = date
        self.physician_id = physician_id
        self.patient = patient

    def create(self):
        id = db.collection("appointments").document().id
        db.collection("appointments").document(id).set(
            {
                "id": id,
                "date": self.date,
                "physician_id": self.physician_id,
                "patient_id": self.patient,
                "created_at": round(time.time()),
            }
        )
        return id
