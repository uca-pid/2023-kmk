from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, firestore

from app.models.entities.Admin import Admin

db = firestore.client()


class Auth:
    @staticmethod
    def has_bearer_token(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        if token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User has already logged in",
            )
        return False

    @staticmethod
    def is_logged_in(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must be logged in",
            )
        try:
            verified_token = auth.verify_id_token(token.credentials)
            member = db.collection("physicians").document(verified_token["uid"]).get()
            if member.exists:
                if member.to_dict()["approved"] == "denied":
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Physician must be approved by admin",
                    )
            return verified_token["uid"]
        except:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must be logged in",
            )

    @staticmethod
    def is_admin(
        token: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    ):
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must provide a valid token",
            )

        try:
            verified_token = auth.verify_id_token(token.credentials)
            user_uid = verified_token["uid"]

            if Admin.is_admin(user_uid):
                return user_uid
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User must be an admin",
                )

        except:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or user must be an admin",
            )
