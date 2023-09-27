from pydantic import BaseModel


class AdminsResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str


class GetAdminsResponse(BaseModel):
    admins: list[AdminsResponse]


class GetAdminsError(BaseModel):
    detail: str
