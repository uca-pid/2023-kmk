from pydantic import BaseModel
from typing import Union


class GetRecordError(BaseModel):
    detail: str


class BasicRecordResponse(BaseModel):
    name: str
    last_name: str
    birth_date: str
    sex: str
    blood_type: str
    id: str
    observations: list


class GetRecordResponse(BaseModel):
    record: BasicRecordResponse
