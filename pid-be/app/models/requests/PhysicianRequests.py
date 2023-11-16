from pydantic import BaseModel
from typing import Dict


class AgendaUpdateRequest(BaseModel):
    start: float
    finish: float
