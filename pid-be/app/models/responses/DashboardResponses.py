from pydantic import BaseModel
from typing import Dict, Optional


class BasicDashboardResponse(BaseModel):
    all_appointments: Optional[Dict[str, int]] = None
    all_appointments_by_specialty: Optional[Dict[str, int]] = None
    updated_appointments: Optional[Dict[str, int]] = None


class SuccessfullDashboardResponse(BaseModel):
    dashboard_metrics: BasicDashboardResponse


class DashboardErrorResponse(BaseModel):
    detail: str
