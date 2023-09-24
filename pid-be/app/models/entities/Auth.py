from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth


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
            return verified_token["uid"]
        except:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User must be logged in",
            )
