import time
from fastapi import UploadFile
from firebase_admin import storage, firestore

db = firestore.client()


class Analysis:
    analysis: list[UploadFile]
    uid: str

    def __init__(self, analysis: list[UploadFile], uid: str):
        self.analysis = analysis
        self.uid = uid

    async def save(self):
        response_data = []
        bucket = storage.bucket()
        print(len(self.analysis))
        for analysis_to_upload in self.analysis:
            id = (
                db.collection("analysis")
                .document(self.uid)
                .collection("uploaded_analysis")
                .document()
                .id
            )
            blob = bucket.blob(f"analysis/{self.uid}/{analysis_to_upload.filename}")
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
