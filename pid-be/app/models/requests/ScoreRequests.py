import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal
from fastapi import Query

class LoadScoreRequest(BaseModel):
    physician_id: str
    puntuality: float
    attention: float
    cleanliness: float
    facilities: float
    price: float