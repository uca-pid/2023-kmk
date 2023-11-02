import time
from fastapi import UploadFile, HTTPException, status
from firebase_admin import storage, firestore

from app.models.entities.Patient import Patient

db = firestore.client()


class Analysis:
    analysis: list[UploadFile]
    uid: str

    def __init__(self, analysis: list[UploadFile], uid: str):
        if not Patient.is_patient(uid):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be a patient to upload analysis",
            )
        self.uid = uid
        self.analysis = analysis

    async def save(self):
        response_data = []
        bucket = storage.bucket()
        for analysis_to_upload in self.analysis:
            id = (
                db.collection("analysis")
                .document(self.uid)
                .collection("uploaded_analysis")
                .document()
                .id
            )
            blob = bucket.blob(
                f"analysis/{self.uid}/{id}.{analysis_to_upload.filename.split('.')[-1]}"
            )
            blob.upload_from_file(analysis_to_upload.file)
            blob.make_public()
            document_data_object = {
                "id": id,
                "file_name": analysis_to_upload.filename,
                "uploaded_at": round(time.time()),
                "url": blob.public_url,
            }
            db.collection("analysis").document(self.uid).collection(
                "uploaded_analysis"
            ).document(id).set(document_data_object)
            response_data.append(document_data_object)
        return response_data

    @staticmethod
    def get_all_for(uid):
        uploaded_analysis = (
            db.collection("analysis")
            .document(uid)
            .collection("uploaded_analysis")
            .get()
        )
        return list(map(lambda analysis: analysis.to_dict(), uploaded_analysis))
