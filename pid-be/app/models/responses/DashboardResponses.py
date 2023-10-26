from pydantic import BaseModel
from typing import Union


class BasicRecordResponse(BaseModel):
    turnos_totales: int
    turnos_pendientes: int
    turnos_cancelados: int


class SuccessfullDashboardResponse(BaseModel):
    dashboard_metrics: BasicRecordResponse


class DashboardErrorResponse(BaseModel):
    detail: str
