from pydantic import BaseModel


class PhysicianResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
