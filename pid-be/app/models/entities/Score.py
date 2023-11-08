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
    def get_by_id(physician_id):
        return db.collection("scores").document(physician_id).get().to_dict()
    
    @staticmethod
    def add_scores(physician_id, scores):
        score_ref = db.collection("scores").document(physician_id)
        score_ref.update(
            {"punality": firestore.ArrayUnion(scores["puntuality"]),
            "attention": firestore.ArrayUnion(scores["attention"]),
            "cleanliness": firestore.ArrayUnion(scores["cleanliness"]),
            "facilities": firestore.ArrayUnion(scores["facilities"]),
            "price": firestore.ArrayUnion(scores["price"]),}
        )

    
    @staticmethod
    def get_scores(physician_id):
        scores = db.collection("scores").document(physician_id).get().to_dict()

        avg_puntuality = sum(scores["puntuality"]) / len(scores["puntuality"])
        avg_attention = sum(scores["attention"]) / len(scores["attention"])
        avg_cleanliness = sum(scores["cleanliness"]) / len(scores["cleanliness"])
        avg_facilities = sum(scores["facilities"]) / len(scores["facilities"])
        avg_price = sum(scores["price"]) / len(scores["price"])

        return {
            "puntuality": avg_puntuality,
            "attention": avg_attention,
            "cleanliness": avg_cleanliness,
            "facilities": avg_facilities,
            "price": avg_price
        }
    

    def create(self):
        if db.collection("scores").document(self.physician_id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The score for this user already exists",
            )
        db.collection("scores").document(self.physician_id).set(
            {
            "puntuality": self.puntuality,
            "attention": self.attention,
            "cleanliness": self.cleanliness,
            "facilities": self.facilities,
            "price": self.price,
            }
        )
        return self.id