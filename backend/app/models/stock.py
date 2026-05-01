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


class StockDetailResponse(BaseModel):
    ticker: str
    company_name: Optional[str]
    analyst_target_price: Optional[float]
    earnings_date: Optional[str]
    sector: Optional[str]
    description: Optional[str]
    market_cap: Optional[float]
    volume: Optional[float]
    avg_volume: Optional[float]
    dividend_yield: Optional[float]
    beta: Optional[float]
    fifty_two_week_high: Optional[float]
    fifty_two_week_low: Optional[float]