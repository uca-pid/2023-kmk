from firebase_admin import firestore

db = firestore.client()


class Physician:
    @staticmethod
    def exists_physician_with(id):
        physician_document = db.collection("physicians").document(id).get()
        return physician_document.exists

    @staticmethod
    def get_by_id(id):
        return db.collection("physicians").document(id).get().to_dict()
