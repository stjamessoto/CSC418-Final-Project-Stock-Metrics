from typing import Optional
from pydantic import BaseModel


class MetricsSnapshot(BaseModel):
    growth_rate: Optional[float] = None
    pe_ratio: Optional[float] = None
    peg_ratio: Optional[float] = None


class FavoriteCreate(BaseModel):
    ticker: str
    industry: str
    userId: str = "guest"
    metrics: MetricsSnapshot


class FavoriteItem(BaseModel):
    ticker: str
    industry: str
    userId: str
    metrics: MetricsSnapshot
