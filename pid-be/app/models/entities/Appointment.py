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

    @staticmethod
    def get_all_appointments_for_user_with(uid):
        appointments = (
            db.collection("appointments").where("patient_id", "==", uid).get()
        )

        return [appointment.to_dict() for appointment in appointments]

    @staticmethod
    def get_by_id(id):
        return db.collection("appointments").document(id).get().to_dict()

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
