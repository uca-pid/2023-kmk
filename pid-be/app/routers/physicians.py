from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Physician import Physician
from app.models.responses.PhysicianResponses import (
    GetPhysiciansResponse,
    GetPhysiciansError,
)

router = APIRouter(
    prefix="/physicians",
    tags=["Physicians"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/specialty/{specialty_name}",
    status_code=status.HTTP_200_OK,
    response_model=GetPhysiciansResponse,
    responses={
        401: {"model": GetPhysiciansError},
        500: {"model": GetPhysiciansError},
    },
)
def get_physicians_by_specialty(specialty_name: str, uid=Depends(Auth.is_logged_in)):
    """
    Get all physicians by location.

    This will allow authenticated users to retrieve all physicians that are specialized in chosen specialty.

    This path operation will:

    * Return all the physicians in the system that match the given specialty.
    * Throw an error if physician retrieving fails.
    """
    try:
        physicians = Physician.get_by_specialty(specialty_name)
        return {"physicians": physicians}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
