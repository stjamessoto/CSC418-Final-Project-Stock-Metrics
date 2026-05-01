from fastapi import APIRouter
from ..models.stock import StockResponse, StockDetailResponse
from ..services.stock_service import get_stock_metrics, get_stock_detail

router = APIRouter()


@router.get("/stock/{ticker}/detail", response_model=StockDetailResponse)
def get_stock_detail_route(ticker: str):
    return get_stock_detail(ticker)


@router.get("/stock/{ticker}", response_model=StockResponse)
def get_stock(ticker: str):
    return get_stock_metrics(ticker)