import time
from pydantic import BaseModel, validator
from fastapi import Query

from app.models.entities.Physician import Physician


class AppointmentCreationRequest(BaseModel):
    date: int = Query(
        description="Date should be in seconds. The _date_ must be after now"
    )
    physician_id: str = Query(
        description="The _physician_id_ must be the id of an existant physician"
    )

    @validator("date")
    def validate_date(cls, date_to_validate):
        if date_to_validate < time.time():
            raise ValueError("Date can't be in the past")
        return date_to_validate

    @validator("physician_id")
    def validate_physician_id(cls, physician_id_to_validate):
        if not Physician.exists_physician_with(physician_id_to_validate):
            raise ValueError("Physician id doesnt belong to an existant physician")
        if not Physician.get_by_id(physician_id_to_validate)["approved"] == "approved":
            raise ValueError("Can only set an appointment with a valid physician")
        return physician_id_to_validate
