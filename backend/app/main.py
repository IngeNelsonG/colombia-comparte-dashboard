import os
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import simulator

app = FastAPI(
    title="Colombia Comparte - Dashboard Markov",
    description="API para simulación de navegación de usuarios con cadenas de Márkov",
    version="1.0.0"
)

def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "").strip()
    
    # Si es wildcard
    if raw_origins == "*":
        return ["*"]
    
    # Si tiene contenido, intentar parsear
    if raw_origins:
        # Intentar como JSON ["url1", "url2"]
        try:
            parsed = json.loads(raw_origins)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        # Intentar como CSV url1,url2
        return [o.strip() for o in raw_origins.split(",") if o.strip()]
    
    # Fallback local
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


# Configurar CORS — debe ir antes del router
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
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