from fastapi import status, HTTPException

from firebase_admin import firestore

from app.models.entities.Physician import Physician

db = firestore.client()


class Record:
    name: str
    last_name: str
    birth_date: str
    gender: str
    blood_type: str
    id: str
    observations: list

    def __init__(
        self,
        name: str,
        last_name: str,
        birth_date: str,
        gender: str,
        blood_type: str,
        id: str,
    ):
        self.name = name
        self.last_name = last_name
        self.birth_date = birth_date
        self.gender = gender
        self.blood_type = blood_type
        self.id = id
        self.observations = []

    @staticmethod
    def add_observation(id, observation, uid):
        record_ref = db.collection("records").document(id)
        physician = Physician.get_by_id(uid)
        observation["physician"] = physician.first_name + " " + physician.last_name
        observation["specialty"]: physician.specialty
        record_ref.update({"observations": firestore.ArrayUnion([observation])})

        updated_record = record_ref.get().to_dict()
        return updated_record

    @staticmethod
    def get_by_id(id):
        return db.collection("records").document(id).get().to_dict()

    def create(self):
        if db.collection("records").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The record already exists",
            )
        db.collection("records").document(self.id).set(
            {
                "id": self.id,
                "name": self.name,
                "last_name": self.last_name,
                "birth_date": self.birth_date,
                "gender": self.gender,
                "blood_type": self.blood_type,
                "observations": self.observations,
            }
        )
