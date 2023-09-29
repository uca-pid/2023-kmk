from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Physician:
    role: str
    name: str
    last_name: str
    matricula: int
    specialty: str
    email: str
    password: str
    id: str
    approved: str

    def __init__(
        self,
        role: str,
        name: str,
        last_name: str,
        matricula: int,
        specialty: str,
        email: str,
        password: str,
        id: str,
        approved: str,
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.matricula = matricula
        self.specialty = specialty
        self.email = email
        self.password = password
        self.id = id
        self.approved = approved

    @staticmethod
    def exists_physician_with(id):
        physician_document = db.collection("physicians").document(id).get()
        return physician_document.exists

    @staticmethod
    def get_by_id(id):
        return db.collection("physicians").document(id).get().to_dict()

    @staticmethod
    def get_by_specialty(specialty_name):
        physicians = (
            db.collection("physicians").where("specialty", "==", specialty_name).get()
        )
        return [physician.to_dict() for physician in physicians]

    @staticmethod
    def has_availability(id, date):
        physician_doc = db.collection("physicians").document(id).get().to_dict()
        day_of_week_of_appointment = str(datetime.fromtimestamp(date).isoweekday())
        precise_start_hour_of_appointment = (
            datetime.fromtimestamp(date).hour + datetime.fromtimestamp(date).minute / 60
        )

        if not physician_doc["agenda"].get(day_of_week_of_appointment):
            return False

        if physician_doc.get("appointments") and physician_doc["appointments"].get(
            str(date)
        ):
            return False

        appointment_begins_after_shift_starts = (
            precise_start_hour_of_appointment
            >= physician_doc["agenda"][day_of_week_of_appointment]["start"]
        )

        appointment_finishes_before_shift_ends = (
            precise_start_hour_of_appointment + 0.5
            <= physician_doc["agenda"][day_of_week_of_appointment]["finish"]
        )

        return (
            appointment_begins_after_shift_starts
            and appointment_finishes_before_shift_ends
        )

    @staticmethod
    def schedule_appointment(id, date):
        db.collection("physicians").document(id).update({f"appointments.{date}": True})

    @staticmethod
    def approve_physician(id):
        # db.collection("physicians").document(id).update({"approved": "approved"})
        # Obtener la referencia al documento del médico en Firestore
        physician_ref = db.collection("physicians").document(id)
        # Actualizar el campo "approved" a "approved"
        physician_ref.update({"approved": "approved"})
        # physician_ref.set({"approved": "approved"}, merge=True)

        return id

    @staticmethod
    def deny_physician(id):
        # db.collection("physicians").document(id).update({"approved": "approved"})
        # Obtener la referencia al documento del médico en Firestore
        physician_ref = db.collection("physicians").document(id)
        # Actualizar el campo "approved" a "approved"
        physician_ref.update({"approved": "denied"})
        # physician_ref.set({"approved": "approved"}, merge=True)

        return id
    
    @staticmethod
    def get_pending_physicians():
        physicians = (
            db.collection("physicians").where("approved", "==", "pending").get()
        )
        return [physician.to_dict() for physician in physicians]
      
    @staticmethod
    def is_physician(id):
        if db.collection("physicians").document(id).get().to_dict():
            return True
        return False

    def create(self):
        db.collection("physicians").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "last_name": self.last_name,
                "matricula": self.matricula,
                "specialty": self.specialty,
                "email": self.email,
                "approved": self.approved,
                "agenda": {"1": {"start": 8, "finish": 18}, "2": {"start": 8, "finish": 18}, "3": {"start": 8, "finish": 18}, "4": {"start": 8, "finish": 18}, "5": {"start": 8, "finish": 18}},
            }
        )
        return self.id
