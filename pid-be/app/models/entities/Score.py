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
    def add_scores(scores):
        physician_id = scores.physician_id
        score_ref = db.collection("scores").document(physician_id)
        print(score_ref.get().to_dict())
        # Verifica si el documento ya existe
        if score_ref.get().exists:
            current_scores = score_ref.get().to_dict()
        else:
            current_scores = {
                "puntuality": [],
                "attention": [],
                "cleanliness": [],
                "facilities": [],
                "price": [],
            }
        print("--------------")
        print(current_scores)
        # Agrega puntajes únicos a cada lista
        current_scores["puntuality"].append(scores.puntuality)
        current_scores["attention"].append(scores.attention)
        current_scores["cleanliness"].append(scores.cleanliness)
        current_scores["facilities"].append(scores.facilities)
        current_scores["price"].append(scores.price)

        # Realiza la actualización en Firestore
        score_ref.set(current_scores)


    @staticmethod
    def get_scores(physician_id):
        scores = db.collection("scores").document(physician_id).get().to_dict()

        avg_puntuality = sum(scores["puntuality"]) / len(scores["puntuality"])
        avg_attention = sum(scores["attention"]) / len(scores["attention"])
        avg_cleanliness = sum(scores["cleanliness"]) / len(scores["cleanliness"])
        avg_facilities = sum(scores["facilities"]) / len(scores["facilities"])
        avg_price = sum(scores["price"]) / len(scores["price"])

        return {
            "puntuality": round(avg_puntuality,1),
            "attention": round(avg_attention,1),
            "cleanliness": round(avg_cleanliness,1),
            "facilities": round(avg_facilities,1),
            "price": round(avg_price,1)
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