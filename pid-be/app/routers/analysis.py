from fastapi import APIRouter, status, Depends, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Union

from app.models.entities.Auth import Auth
from app.models.entities.Analysis import Analysis
from app.models.responses.AnalysisResponses import (
    AnalysisUploadErrorResponse,
    SuccessfullAnalysisResponse,
    AnalysisGetErrorResponse,
)

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=list[Union[SuccessfullAnalysisResponse, None]],
    responses={
        401: {"model": AnalysisUploadErrorResponse},
        403: {"model": AnalysisUploadErrorResponse},
        500: {"model": AnalysisUploadErrorResponse},
    },
)
async def upload_analysis(analysis: list[UploadFile], uid=Depends(Auth.is_logged_in)):
    analysis = Analysis(analysis=analysis, uid=uid)
    try:
        saved_analysis = await analysis.save()
        return saved_analysis
    except HTTPException as http_exception:
        return http_exception
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[SuccessfullAnalysisResponse],
    responses={
        401: {"model": AnalysisGetErrorResponse},
        500: {"model": AnalysisGetErrorResponse},
    },
)
def get_all_analysis(uid=Depends(Auth.is_logged_in)):
    try:
        return Analysis.get_all_for(uid=uid)
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/{patient_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[SuccessfullAnalysisResponse],
    responses={
        401: {"model": AnalysisGetErrorResponse},
        500: {"model": AnalysisGetErrorResponse},
    },
)
def get_all_analysis(patient_id: str):
    try:
        return Analysis.get_all_for(uid=patient_id)
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
