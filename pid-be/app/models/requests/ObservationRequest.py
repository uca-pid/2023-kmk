from pydantic import BaseModel, Field, validator
from typing import Annotated, Literal
from fastapi import Query


class ObservationRequest(BaseModel):
    appointment_id: str
    attended: str
    real_start_time: str
    observation: str

