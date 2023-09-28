from pydantic import BaseModel


class SuccessfulLoginResponse(BaseModel):
    token: str


class LoginErrorResponse(BaseModel):
    detail: str


class SuccessfullRegisterResponse(BaseModel):
    message: str


class RegisterErrorResponse(BaseModel):
    detail: str

class UserProfileResponse(BaseModel):
    profile: str
    approved:str = None

class UserProfileErrorResponse(BaseModel):
    detail: str