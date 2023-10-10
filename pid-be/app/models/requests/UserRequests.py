from pydantic import BaseModel, Field, validator
from typing import Annotated, Literal
from fastapi import Query

from app.models.entities.Specialty import Specialty


class UserLoginRequest(BaseModel):
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str


class PatientRegisterRequest(BaseModel):
    role: Literal["patient"] = "patient"
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str


class PhysicianRegisterRequest(BaseModel):
    role: Literal["physician"] = "physician"
    name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str
    tuition: str
    specialty: str

    @validator("specialty")
    def validate_specialty(cls, specialty_to_validate):
        if not Specialty.exists_with_name(specialty_to_validate):
            raise ValueError("Specilaty doesnt exist")
        return specialty_to_validate
