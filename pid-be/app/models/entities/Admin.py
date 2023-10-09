from fastapi import HTTPException, status
from firebase_admin import firestore

db = firestore.client()


class Admin:
    name: str
    last_name: str
    email: str
    id: str
    registered_by: str

    def __init__(
        self, name: str, last_name: str, email: str, id: str, registered_by: str
    ):
        self.name = name
        self.last_name = last_name
        self.email = email
        self.id = id
        self.registered_by = registered_by

    @staticmethod
    def get_by_id(id):
        return db.collection("superusers").document(id).get().to_dict()

    @staticmethod
    def is_admin(id):
        return db.collection("superusers").document(id).get().exists

    def create(self):
        if db.collection("superusers").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The admin already exists",
            )
        db.collection("superusers").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "last_name": self.last_name,
                "email": self.email,
                "registered_by": self.registered_by,
            }
        )
