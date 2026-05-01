import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Root .env lives two levels above this file (project root)
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from .routes.favorites import router as favorites_router
from .routes.auth import router as auth_router
from .routes import stocks

app = FastAPI(title="Stock Metrics API", version="1.0.0")

_origins = [
    o.strip()
    for o in os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173,http://localhost:3000",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router)
app.include_router(favorites_router)
app.include_router(auth_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
