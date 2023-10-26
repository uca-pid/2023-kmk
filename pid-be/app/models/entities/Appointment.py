import time
from firebase_admin import firestore
from fastapi import HTTPException, status

from .Physician import Physician
from .Patient import Patient

db = firestore.client()


class Appointment:
    id: str = None
    date: int
    physician_id: str
    patient_id: str
    created_at: int = None
    updated_at: int = None
    approved: str

    def __init__(
        self,
        date: int,
        physician_id: str,
        patient_id: str,
        id: str = None,
        created_at: int = None,
        updated_at: int = None,
        approved: str = "pending",
    ):
        if not Patient.is_patient(patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can create appointments",
            )

        self.physician_id = physician_id
        self.date = date
        self.patient_id = patient_id
        self.id = id
        self.created_at = created_at
        self.updated_at = updated_at
        self.approved = approved

    @staticmethod
    def get_all_appointments_for_user_with(uid):
        if Patient.is_patient(uid):
            appointments = (
                db.collection("appointments")
                .where("patient_id", "==", uid)
                .where("approved", "==", "approved")
                .order_by("date")
                .get()
            )
        else:
            appointments = (
                db.collection("appointments")
                .where("physician_id", "==", uid)
                .where("approved", "==", "approved")
                .order_by("date")
                .get()
            )
        return [appointment.to_dict() for appointment in appointments]

    @staticmethod
    def get_all_appointments_for_physician_with(uid):
        appointments = (
            db.collection("appointments").where("physician_id", "==", uid).get()
        )

        return [appointment.to_dict() for appointment in appointments]
    
    @staticmethod
    def get_all_appointments():
        appointments = (
            db.collection("appointments").get()
        )

        return [appointment.to_dict() for appointment in appointments]
    
    @staticmethod
    def get_all_appointments_updtated_for_physician(uid):
        updated_appointments = (
            db.collection("appointments").where("physician_id", "==", uid).where("updated_at", "!=", None).get()
        )
        return [appointment.to_dict() for appointment in updated_appointments]
    
    @staticmethod
    def get_all_appointments_updtated(uid):
        updated_appointments = (
            db.collection("appointments").where("updated_at", "!=", None).get()
        )
        return [appointment.to_dict() for appointment in updated_appointments]

    @staticmethod
    def get_by_id(id):
        appointment_document = db.collection("appointments").document(id).get()
        if appointment_document.exists:
            return Appointment(**appointment_document.to_dict())
        return None

    @staticmethod
    def is_appointment(id):
        return db.collection("appointments").document(id).get().exists

    @staticmethod
    def get_pending_appointments(id):
        appointments = (
            db.collection("appointments")
            .where("physician_id", "==", id)
            .where("approved", "==", "pending")
            .get()
        )
        return [appointment.to_dict() for appointment in appointments]

    def delete(self):
        db.collection("appointments").document(self.id).delete()
        Physician.free_agenda(self.physician_id, self.date)

    def update(self, updated_values):
        if not Physician.has_availability(
            id=self.physician_id, date=updated_values["date"]
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only set appointment at physicians available hours",
            )
        Physician.free_agenda(self.physician_id, self.date)
        db.collection("appointments").document(self.id).update(
            {**updated_values, "updated_at": round(time.time()), "approved": "pending"}
        )
        self.date = updated_values["date"]
        Physician.schedule_appointment(id=self.physician_id, date=self.date)

    def create(self):
        id = db.collection("appointments").document().id
        db.collection("appointments").document(id).set(
            {
                "id": id,
                "date": self.date,
                "physician_id": self.physician_id,
                "patient_id": self.patient_id,
                "created_at": round(time.time()),
                "approved": self.approved,
            }
        )
        Physician.schedule_appointment(id=self.physician_id, date=self.date)
        return id
