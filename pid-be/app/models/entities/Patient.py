from firebase_admin import firestore

db = firestore.client()


class Patient:
    role: str
    name: str
    last_name: str
    email: str
    password: str
    id: str

    def __init__(
        self, role: str, name: str, last_name: str, email: str, password: str, id: str
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.id = id

    @staticmethod
    def get_by_id(id):
        return db.collection("patients").document(id).get().to_dict()
    
    @staticmethod
    def is_patient(id):
        if db.collection("patients").document(id).get().to_dict():
            return True
        return False

    def create(self):
        db.collection("patients").document(self.id).set(
            {
                "id": self.id,
                "name": self.name,
                "last_name": self.last_name,
                "email": self.email,
            }
        )
        return self.id
