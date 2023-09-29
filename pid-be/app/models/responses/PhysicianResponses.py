from pydantic import BaseModel

from .AgendaResponses import AgendaResponse


class PhysicianResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialty: str
    agenda: AgendaResponse

    def __init__(self, **data):
        data["agenda"] = AgendaResponse(
            **{
                "agenda": data["agenda"],
                "appointments": list(data["appointments"].keys())
                if data.get("appointments")
                else [],
            }
        ).dict()
        super().__init__(**data)


class GetPhysiciansResponse(BaseModel):
    physicians: list[PhysicianResponse]


class GetPhysiciansError(BaseModel):
    detail: str
