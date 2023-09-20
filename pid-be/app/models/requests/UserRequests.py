from pydantic import BaseModel
from typing import Annotated
from fastapi import Query


class UserLoginRequest(BaseModel):
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str


class UserRegisterRequest(BaseModel):
    role: str
    name: str
    last_name: str
    matricula: str
    specialty: str
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str
