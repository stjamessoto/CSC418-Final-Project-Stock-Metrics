from typing import Optional

from fastapi import APIRouter, Query

from ..models.favorite import FavoriteCreate, FavoriteItem
from ..services import favorites_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("", response_model=FavoriteItem, status_code=201)
def save_favorite(body: FavoriteCreate):
    return favorites_service.save_favorite(body)


@router.get("", response_model=list[FavoriteItem])
def get_favorites(
    userId: str = Query(default="guest"),
    industry: Optional[str] = Query(default=None),
):
    return favorites_service.get_favorites(userId, industry)


@router.delete("/{ticker}", status_code=204)
def delete_favorite(ticker: str, userId: str = Query(default="guest")):
    favorites_service.delete_favorite(userId, ticker)
