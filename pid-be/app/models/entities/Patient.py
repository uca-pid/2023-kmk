from firebase_admin import firestore

db = firestore.client()


class Patient:
    @staticmethod
    def get_by_id(id):
        return db.collection("patients").document(id).get().to_dict()
