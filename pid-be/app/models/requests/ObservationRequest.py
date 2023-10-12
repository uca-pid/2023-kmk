from pydantic import BaseModel, Field, validator
from typing import Annotated, Literal
from fastapi import Query


class ObservationRequest(BaseModel):
    date: str
    physician: str
    specialty: str
    observation: str
