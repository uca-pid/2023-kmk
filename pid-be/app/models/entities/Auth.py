from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


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
