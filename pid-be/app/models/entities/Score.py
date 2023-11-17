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
        # Obtener el documento existente de Firestore
        doc_ref = db.collection("scores").document(self.appointment_id)
        doc = doc_ref.get()
        
        # Verificar si el documento ya existe
        if doc.exists:
            data = doc.to_dict()
            
            # Actualizar los campos en la base de datos
            doc_ref.update({
                "puntuality": (data.get("puntuality", []) + self.puntuality)/2,
                "attention": (data.get("attention", []) + self.attention)/2,
                "cleanliness": (data.get("cleanliness", []) + self.cleanliness)/2,
                "facilities": (data.get("facilities", []) + self.facilities)/2,
                "price": (data.get("price", []) + self.price)/2,
            })
        else:
            # Si el documento no existe, establecer los valores por primera vez
            doc_ref.set({
                "appointment_id": self.appointment_id,
                "puntuality": self.puntuality,
                "attention": self.attention,
                "cleanliness": self.cleanliness,
                "facilities": self.facilities,
                "price": self.price,
            })

        print("Listo")
        return self.appointment_id
