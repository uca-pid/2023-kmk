from firebase_admin import firestore

db = firestore.client()


class Specialty:
    @staticmethod
    def get_all():
        specialties_doc = db.collection("specialties").order_by("name").get()
        return [specialty_doc.to_dict()["name"] for specialty_doc in specialties_doc]

    @staticmethod
    def exists_with_name(name):
        return len(db.collection("specialties").where("name", "==", name).get()) > 0
    
    @staticmethod
    def add_specialty(name):
        db.collection("specialties").document().set({"name": name})

    @staticmethod
    def delete_specialty(id):
        db.collection("specialties").document(id).delete()
