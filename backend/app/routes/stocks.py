from fastapi import APIRouter
from ..models.stock import StockResponse, StockDetailResponse, StockNewsResponse
from ..services.stock_service import get_stock_metrics, get_stock_detail, get_stock_news

router = APIRouter()


@router.get("/stock/{ticker}/detail", response_model=StockDetailResponse)
def get_stock_detail_route(ticker: str):
    return get_stock_detail(ticker)


@router.get("/stock/{ticker}/news", response_model=StockNewsResponse)
def get_stock_news_route(ticker: str):
    return get_stock_news(ticker)


@router.get("/stock/{ticker}", response_model=StockResponse)
def get_stock(ticker: str):
    return get_stock_metrics(ticker)