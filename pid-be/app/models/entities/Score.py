from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Score:
    appointment_id: str
    puntuality: list
    attention: list
    cleanliness: list
    facilities: list
    price: list

    def __init__(
        self,
        appointment_id: str,
        puntuality: list,
        attention: list,
        cleanliness: list,
        facilities: list,
        price: list,
    ):
        self.appointment_id = appointment_id
        self.puntuality = puntuality
        self.attention = attention
        self.cleanliness = cleanliness
        self.facilities = facilities
        self.price = price

    @staticmethod
    def get_score(id):
        return db.collection("scores").document(id).get().to_dict()
    

    def create(self):
        id = db.collection("scores").document(self.appointment_id).id
        db.collection("scores").document(id).set(
            {
             "appointment_id": self.appointment_id,
             "puntuality": self.puntuality,
             "attention": self.attention,
             "cleanliness": self.cleanliness,
             "facilities": self.facilities,
             "price": self.price  
            }
        )
        print('listo')
        return self.appointment_id