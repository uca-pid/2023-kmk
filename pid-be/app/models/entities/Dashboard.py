from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()


class Dashboard:
    physcian_id: str
    turnos_totales: int
    turnos_modificados: int

    def __init__(
        self,
        physcian_id: str,
        turnos_totales: int,
        turnos_modificados: int,
    ):
        self.physcian_id = physcian_id,
        self.turnos_totales = turnos_totales,
        self.turnos_modificados = turnos_modificados
