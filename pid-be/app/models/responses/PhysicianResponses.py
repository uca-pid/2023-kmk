from pydantic import BaseModel


class PhysicianResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialty: str


class GetPhysiciansResponse(BaseModel):
    physicians: list[PhysicianResponse]


class GetPhysiciansError(BaseModel):
    detail: str
