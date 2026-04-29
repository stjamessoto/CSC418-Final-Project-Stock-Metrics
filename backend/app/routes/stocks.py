from fastapi import APIRouter
from app.models.stock import StockResponse
from app.services.stock_service import get_stock_metrics

router = APIRouter()


@router.get("/stock/{ticker}", response_model=StockResponse)
def get_stock(ticker: str):
    return get_stock_metrics(ticker)