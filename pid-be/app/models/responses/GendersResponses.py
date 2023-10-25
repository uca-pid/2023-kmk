from pydantic import BaseModel
from typing import Union


class GetGendersResponse(BaseModel):
    genders: list[Union[str, None]]


class GetGendersError(BaseModel):
    detail: str
