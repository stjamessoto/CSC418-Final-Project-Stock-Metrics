import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Root .env lives two levels above this file (project root)
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from .routes.favorites import router as favorites_router  # noqa: E402

app = FastAPI(title="Stock Metrics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(favorites_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
