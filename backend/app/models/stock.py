from pydantic import BaseModel
from typing import Optional


class StockResponse(BaseModel):
    ticker: str
    growth_rate: float
    pe_ratio: Optional[float]
    peg_ratio: Optional[float]
    industry: Optional[str]
    fifty_two_week_high: Optional[float]
    fifty_two_week_low: Optional[float]