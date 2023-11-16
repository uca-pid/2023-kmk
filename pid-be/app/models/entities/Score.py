from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Score:
    physician_id: str
    puntuality: list
    attention: list
    cleanliness: list
    facilities: list
    price: list

    def __init__(
        self,
        physician_id: str,
        puntuality: list,
        attention: list,
        cleanliness: list,
        facilities: list,
        price: list,
    ):
        self.physician_id = physician_id
        self.puntuality = puntuality
        self.attention = attention
        self.cleanliness = cleanliness
        self.facilities = facilities
        self.price = price

    @staticmethod
    def get_score(id):
        return db.collection("scores").document(id).get().to_dict()

    def create(self):
        id = db.collection("scores").document(self.physician_id).id
        db.collection("scores").document(id).set(
            {
                "physician_id": self.physician_id,
                "puntuality": self.puntuality,
                "attention": self.attention,
                "cleanliness": self.cleanliness,
                "facilities": self.facilities,
                "price": self.price,
            }
        )
        print("listo")
        return self.physician_id
