from pydantic import BaseModel
from typing import Annotated
from fastapi import Query


class UserLoginRequest(BaseModel):
    email: Annotated[str, Query(regex="^[-\w\.]+@([-\w]+\.)+[-\w]{2,4}$")]
    password: str
