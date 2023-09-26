from pydantic import BaseModel


class GetSpecialtiesResponse(BaseModel):
    specialties: list[str]


class GetSpecialtyError(BaseModel):
    detail: str
