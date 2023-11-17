from pydantic import BaseModel

class SuccessfullLoadScoreResponse(BaseModel):
    message: str

class ScoreErrorResponse(BaseModel):
    detail: str

class BasicScoreResponse(BaseModel):
    puntuality: float
    attention: float
    cleanliness: float
    facilities: float
    price: float


class SuccessfullScoreResponse(BaseModel):
    score_metrics: BasicScoreResponse

class PendingScoresErrorResponse(BaseModel):
    detail: str

class PendingScoresResponse(BaseModel):
    scores: list