from pydantic import BaseModel
from typing import Union


class GetBloodTypesResponse(BaseModel):
    blood_types: list[Union[str, None]]


class GetBloodTypesError(BaseModel):
    detail: str
