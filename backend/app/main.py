import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import simulator

app = FastAPI(
    title="Colombia Comparte - Dashboard Markov",
    description="API para simulación de navegación de usuarios con cadenas de Márkov",
    version="1.0.0"
)

def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "")
    if raw_origins.strip():
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(simulator.router)


@app.get("/")
async def root():
    return {
        "message": "Bienvenido a Colombia Comparte - Dashboard Markov",
        "docs": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
