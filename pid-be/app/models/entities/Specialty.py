from firebase_admin import firestore

db = firestore.client()


class Specialty:
    @staticmethod
    def get_all():
        specialties_doc = db.collection("specialties").order_by("name").get()
        return [specialty_doc.to_dict()["name"] for specialty_doc in specialties_doc]
