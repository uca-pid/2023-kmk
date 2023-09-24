from firebase_admin import firestore

db = firestore.client()


class Physician:
    role: str
    name: str
    last_name: str
    matricula: int
    specialty: str
    email: str
    password: str
    id: str
    approved: str

    def __init__(
        self,
        role: str,
        name: str,
        last_name: str,
        matricula: int,
        specialty: str,
        email: str,
        password: str,
        id: str,
        approved: str,
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.matricula = matricula
        self.specialty = specialty
        self.email = email
        self.password = password
        self.id = id
        self.approved = approved

    @staticmethod
    def exists_physician_with(id):
        physician_document = db.collection("physicians").document(id).get()
        return physician_document.exists

    @staticmethod
    def get_by_id(id):
        return db.collection("physicians").document(id).get().to_dict()

    def create(self):
        id = db.collection("physicians").document().id
        db.collection("physicians").document(id).set(
            {
                "id": self.id,
                "name": self.name,
                "last_name": self.last_name,
                "matricula": self.matricula,
                "specialty": self.specialty,
                "email": self.email,
                "approved": self.approved,
            }
        )
        return self.id
