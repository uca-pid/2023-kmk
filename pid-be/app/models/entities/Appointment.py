import time
from firebase_admin import firestore
from fastapi import HTTPException, status

from .Physician import Physician

db = firestore.client()


class Appointment:
    date: int
    physician_id: str
    patient_id: str

    def __init__(self, date: int, physician_id: str, patient_id: str):
        if not Physician.has_availability(id=physician_id, date=date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only set appointment at physicians available hours",
            )

        self.physician_id = physician_id
        self.date = date
        self.patient_id = patient_id

    @staticmethod
    def get_all_appointments_for_user_with(uid):
        appointments = (
            db.collection("appointments").where("patient_id", "==", uid).get()
        )

        return [appointment.to_dict() for appointment in appointments]

    @staticmethod
    def get_all_appointments_for_physician_with(uid):
        appointments = (
            db.collection("appointments").where("physician_id", "==", uid).get()
        )

        return [appointment.to_dict() for appointment in appointments]

    @staticmethod
    def get_by_id(id):
        return db.collection("appointments").document(id).get().to_dict()

    @staticmethod
    def delete_by_id(id):
        db.collection("appointments").document(id).delete()

    def create(self):
        id = db.collection("appointments").document().id
        db.collection("appointments").document(id).set(
            {
                "id": id,
                "date": self.date,
                "physician_id": self.physician_id,
                "patient_id": self.patient_id,
                "created_at": round(time.time()),
            }
        )
        Physician.schedule_appointment(id=self.physician_id, date=self.date)
        return id
