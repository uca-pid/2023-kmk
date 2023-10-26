from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Dashboard:
    id: str
    approved: str

    def __init__(
        self,
        role: str,
        name: str,
        last_name: str,
        tuition: int,
        specialty: str,
        email: str,
        id: str,
        approved: str = "pending",
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.tuition = tuition
        self.specialty = specialty
        self.email = email
        self.id = id
        self.approved = approved
