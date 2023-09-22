import os
from dotenv import load_dotenv
from .config import *
import uvicorn

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.openapi.utils import get_openapi


# from fastapi import Request
# import firebase_admin

# Cargamos las credenciales de Firebase desde el archivo JSON
# cred = credentials.Certificate(
#     "credentials/pid-kmk-firebase-adminsdk-bwvix-1b5972579a.json"
# )
# firebase_admin.initialize_app(cred)

load_dotenv()

from app.routers import users, appointments


CTX_PORT: int = int(os.environ.get("PORT")) if os.environ.get("PORT") else 8080

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

routers = [users.router, appointments.router]

for router in routers:
    app.include_router(router)


@app.get("/")
async def root() -> RedirectResponse:
    """
    Root endpoint,

    It returns the OPENAPI docs for the KMK API
    """
    return RedirectResponse(url="/redoc", status_code=status.HTTP_303_SEE_OTHER)


# @app.post("/api/register")
# async def register_user(request: Request):
#     data = await request.json()
#     print(data)  # Esto imprimirá los datos en la consola del servidor
#     # Utiliza Firebase Authentication para crear una cuenta de usuario
#     try:
#         user = auth.create_user(
#             email=data["email"],
#             password=data["password"],
#             display_name=data["role"],
#             email_verified=False,  # Cambia a True si deseas que el email esté verificado
#         )
#         print(f"Usuario registrado: {user.uid}")
#         return {"message": "Registro exitoso"}
#     except Exception as e:
#         print(f"Error en el registro: {str(e)}")
#         return {"message": "Error en el registro"}


def start():
    """
    _summary_: Start the application
    """
    print(os.environ)
    uvicorn.run("app.main:app", host="0.0.0.0", port=CTX_PORT, reload=True)


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
