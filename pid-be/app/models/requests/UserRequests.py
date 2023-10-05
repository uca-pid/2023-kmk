from pydantic import BaseModel, Field, validator
from typing import Annotated
from fastapi import Query

from app.models.entities.Specialty import Specialty


class UserLoginRequest(BaseModel):
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str


class UserRegisterRequest(BaseModel):
    role: str
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str
    matricula: str
    specialty: str

    @validator("specialty")
    def validate_specialty(cls, specialty_to_validate):
        if not Specialty.exists_with_name(specialty_to_validate):
            raise ValueError("Specilaty doesnt exist")
        return specialty_to_validate


class AdminRegisterRequest(BaseModel):
    name: str
    last_name: str
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str
