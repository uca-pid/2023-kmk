from fastapi import status, HTTPException

from firebase_admin import firestore

db = firestore.client()


class Record:
    first_name: str
    last_name: str
    email: str
    birth_date: str
    sex: str
    blood_type: str
    id: str
    observations: list

    def __init__(
        self,
        first_name: str,
        last_name: str,
        email: str,
        birth_date: str,
        sex: str,
        blood_type: str,
        id: str,
    ):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.birth_date = birth_date
        self.sex = sex
        self.blood_type = blood_type
        self.id = id
        self.observations = []

    @staticmethod
    def add_observation(id, observation):
        record_ref = db.collection("records").document(id)

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
                "first_name": self.first_name,
                "last_name": self.last_name,
                "email": self.email,
                "birth_date": self.birth_date,
                "sex": self.sex,
                "blood_type": self.blood_type,
                "observations": self.observations,
            }
        )
