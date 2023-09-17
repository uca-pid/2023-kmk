import os

import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.openapi.utils import get_openapi

from app.routers import users

load_dotenv()

CTX_PORT: int = int(os.environ.get("PORT")) if os.environ.get("PORT") else 8080

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

routers = [users.router]

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
    uvicorn.run("app.main:app", host="0.0.0.0", port=CTX_PORT, reload=is_reloading)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Gestion Medica KMK",
        version="1.0.0",
        description="Docs for the KMK API",
        routes=app.routes,
        tags=[
            {
                "name": "Users",
                "description": "Operations that handle users, like **login** and **signup**",
            }
        ],
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://firebasestorage.googleapis.com/v0/b/pid-kmk.appspot.com/o/appResources%2FkmkLogo.png?alt=media&token=fece4f9f-68ac-40a5-b017-55f297ec1fff"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
