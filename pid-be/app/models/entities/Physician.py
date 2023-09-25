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

    @staticmethod
    def get_by_specialty(specialty_name):
        physicians = (
            db.collection("physicians").where("specialty", "==", specialty_name).get()
        )
        return [physician.to_dict() for physician in physicians]
