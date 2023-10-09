from enum import Enum
from pydantic import BaseModel


class SuccessfulLoginResponse(BaseModel):
    token: str


class LoginErrorResponse(BaseModel):
    detail: str


class SuccessfullRegisterResponse(BaseModel):
    message: str


class RegisterErrorResponse(BaseModel):
    detail: str


class UserRolesEnum(str, Enum):
    admin = "admin"
    physician = "physician"
    patient = "patient"


class UserRolesResponse(BaseModel):
    roles: list[UserRolesEnum]


class UserProfileErrorResponse(BaseModel):
    detail: str
