from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Specialty:
    id: str
    name: str

    def __init__(
        self,
        id: str,
        name: str,
    ):
        self.name = name
        self.id = id

    @staticmethod
    def get_all():
        specialties_doc = db.collection("specialties").order_by("name").get()
        return [specialty_doc.to_dict()["name"] for specialty_doc in specialties_doc]

    @staticmethod
    def exists_with_name(name):
        return len(db.collection("specialties").where("name", "==", name).get()) > 0
    
    @staticmethod
    def add_specialty(name):
        print(name)
        db.collection("specialties").document().set({"name": name})

    
    @staticmethod
    def delete_specialty(name):
        query = db.collection("specialties").where("name", "==", name)

        docs = query.stream()

        for doc in docs:
            doc.reference.delete()

        
    def delete(self):
        db.collection("specialties").document(self.id).delete()

    def create(self):
        if db.collection("specialties").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The specialty already exists",
            )
        db.collection("specialties").document(self.id).set(
            {
                "id": self.id,
                "name": self.name,
            }
        )
        return self.id