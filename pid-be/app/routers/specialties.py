from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Specialty import Specialty
from app.models.responses.SpecialtiesResponses import (
    GetSpecialtiesResponse,
    GetSpecialtyError,
)

router = APIRouter(
    prefix="/specialties",
    tags=["Specialties"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=GetSpecialtiesResponse,
    responses={
        500: {"model": GetSpecialtyError},
    },
)
def get_all_specialties():
    """
    Get all specialties.

    This will allow authenticated users to retrieve all specialties.

    This path operation will:

    * Return all the specialties in the system.
    * Throw an error if specialty retrieving fails.
    """
    try:
        specialties = Specialty.get_all()
        return {"specialties": specialties}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
