from firebase_admin import firestore

db = firestore.client()


class Physician:
    id: str
    first_name: str

    @staticmethod
    def exists_physician_with(id):
        physician_document = db.collection("physicians").document(id).get()
        return physician_document.exists
