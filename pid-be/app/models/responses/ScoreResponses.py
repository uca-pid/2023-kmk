from pydantic import BaseModel
from typing import Union

class SuccessfullLoadScoreResponse(BaseModel):
    message: str

class ScoreErrorResponse(BaseModel):
    detail: str

class BasicScoreResponse(BaseModel):
    puntuality: float
    communication: float
    attendance: Union[float, None] = None
    treat: Union[float, None] = None
    cleanliness: Union[float, None] = None
    availability: Union[float, None] = None
    price: Union[float, None] = None
    attention: Union[float, None] = None


class SuccessfullScoreResponse(BaseModel):
    score_metrics: BasicScoreResponse

class PendingScoresErrorResponse(BaseModel):
    detail: str

class PendingScoresResponse(BaseModel):
    scores: list