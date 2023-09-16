import os

import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.openapi.utils import get_openapi

load_dotenv()

CTX_PORT: int = int(os.environ.get("PORT")) if os.environ.get("PORT") else 8080

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

routers = []

for router in routers:
    app.include_router(router)


@app.get("/")
async def root() -> RedirectResponse:
    """
    Root endpoint,

    It returns the OPENAPI docs for the KMK API
    """
    return RedirectResponse(url="/redoc", status_code=status.HTTP_303_SEE_OTHER)


def start():
    """
    _summary_: Start the application
    """
    is_reloading = True
    uvicorn.run("app.main:app", host="0.0.0.0",
                port=CTX_PORT, reload=is_reloading)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Gestion Medica KMK",
        version="1.0.0",
        description="Docs for the KMK API",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
