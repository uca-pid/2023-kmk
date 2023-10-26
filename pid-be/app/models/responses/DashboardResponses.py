from pydantic import BaseModel
from typing import Union


class BasicDashboardResponse(BaseModel):
    turnos_totales: int
    turnos_modificados: int


class SuccessfullDashboardResponse(BaseModel):
    dashboard_metrics: BasicDashboardResponse


class DashboardErrorResponse(BaseModel):
    detail: str
