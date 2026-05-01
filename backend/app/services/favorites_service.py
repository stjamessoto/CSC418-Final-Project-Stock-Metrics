import os
from decimal import Decimal
from typing import Optional

from boto3.dynamodb.conditions import Attr, Key

from ..db.dynamo import get_table
from ..models.favorite import FavoriteCreate, FavoriteItem, MetricsSnapshot

_DEMO_USER = "demo@demo.com"
_demo_store: dict[str, FavoriteItem] = {}

# In-memory store used when DynamoDB is not configured — keyed by userId
_mem_store: dict[str, dict[str, FavoriteItem]] = {}


def _use_dynamo() -> bool:
    return bool(
        os.getenv("DYNAMO_ENDPOINT") or
        (os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"))
    )


def _to_decimal(val: float) -> Decimal:
    return Decimal(str(val))


def _from_decimal(obj):
    """Recursively convert DynamoDB Decimal values back to float."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _from_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_from_decimal(v) for v in obj]
    return obj


def _item_to_model(item: dict) -> FavoriteItem:
    metrics_raw = _from_decimal(item.get("metrics", {}))
    return FavoriteItem(
        ticker=item["ticker"],
        industry=item["industry"],
        userId=item["userId"],
        metrics=MetricsSnapshot(**metrics_raw),
    )


def save_favorite(body: FavoriteCreate) -> FavoriteItem:
    item = FavoriteItem(
        ticker=body.ticker,
        industry=body.industry,
        userId=body.userId,
        metrics=body.metrics,
    )
    if body.userId == _DEMO_USER:
        _demo_store[body.ticker] = item
        return item
    if not _use_dynamo():
        _mem_store.setdefault(body.userId, {})[body.ticker] = item
        return item
    table = get_table()
    metrics_serialized = {
        k: _to_decimal(v)
        for k, v in body.metrics.model_dump().items()
        if v is not None
    }
    table.put_item(
        Item={
            "PK": f"USER#{body.userId}",
            "SK": f"TICKER#{body.ticker}",
            "ticker": body.ticker,
            "userId": body.userId,
            "industry": body.industry,
            "metrics": metrics_serialized,
        }
    )
    return item


def get_favorites(userId: str, industry: Optional[str] = None) -> list[FavoriteItem]:
    if userId == _DEMO_USER:
        items = list(_demo_store.values())
        if industry:
            items = [i for i in items if i.industry == industry]
        return items
    if not _use_dynamo():
        items = list(_mem_store.get(userId, {}).values())
        if industry:
            items = [i for i in items if i.industry == industry]
        return items
    table = get_table()
    if industry:
        response = table.query(
            IndexName="IndustryIndex",
            KeyConditionExpression=Key("industry").eq(industry),
            FilterExpression=Attr("userId").eq(userId),
        )
    else:
        response = table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{userId}"),
        )
    return [_item_to_model(item) for item in response.get("Items", [])]


def delete_favorite(userId: str, ticker: str) -> None:
    if userId == _DEMO_USER:
        _demo_store.pop(ticker, None)
        return
    if not _use_dynamo():
        _mem_store.get(userId, {}).pop(ticker, None)
        return
    table = get_table()
    table.delete_item(
        Key={
            "PK": f"USER#{userId}",
            "SK": f"TICKER#{ticker}",
        }
    )
