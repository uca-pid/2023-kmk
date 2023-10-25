from pydantic import BaseModel
from typing import Union


class GetSpecialtiesResponse(BaseModel):
    specialties: list[Union[str, None]]


class GetSpecialtyError(BaseModel):
    detail: str
