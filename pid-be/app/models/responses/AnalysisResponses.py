from pydantic import BaseModel


class SuccessfullAnalysisResponse(BaseModel):
    id: str
    file_name: str
    uploaded_at: int
    url: str


class AnalysisErrorResponse(BaseModel):
    detail: str


class AnalysisGetErrorResponse(BaseModel):
    detail: str


class SuccessfulAnalysisDeletionResponse(BaseModel):
    message: str
