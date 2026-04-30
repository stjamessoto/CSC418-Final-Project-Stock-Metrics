from decimal import Decimal
from typing import Optional

from boto3.dynamodb.conditions import Attr, Key

from ..db.dynamo import get_table
from ..models.favorite import FavoriteCreate, FavoriteItem, MetricsSnapshot


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
    return FavoriteItem(
        ticker=body.ticker,
        industry=body.industry,
        userId=body.userId,
        metrics=body.metrics,
    )


def get_favorites(userId: str, industry: Optional[str] = None) -> list[FavoriteItem]:
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
    table = get_table()
    table.delete_item(
        Key={
            "PK": f"USER#{userId}",
            "SK": f"TICKER#{ticker}",
        }
    )
