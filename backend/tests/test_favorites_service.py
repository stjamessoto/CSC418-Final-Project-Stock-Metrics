from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from backend.app.models.favorite import FavoriteCreate, MetricsSnapshot
from backend.app.services import favorites_service

MOCK_DB_ITEM = {
    "PK": "USER#guest",
    "SK": "TICKER#AAPL",
    "ticker": "AAPL",
    "userId": "guest",
    "industry": "Technology",
    "metrics": {
        "growth_rate": Decimal("12.5"),
        "pe_ratio": Decimal("28.4"),
        "peg_ratio": Decimal("2.27"),
    },
}


def _make_body(ticker="AAPL", industry="Technology", userId="guest"):
    return FavoriteCreate(
        ticker=ticker,
        industry=industry,
        userId=userId,
        metrics=MetricsSnapshot(growth_rate=12.5, pe_ratio=28.4, peg_ratio=2.27),
    )


class TestSaveFavorite:
    def test_returns_favorite_item(self):
        mock_table = MagicMock()
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            result = favorites_service.save_favorite(_make_body())
        assert result.ticker == "AAPL"
        assert result.userId == "guest"
        assert result.industry == "Technology"
        assert result.metrics.growth_rate == 12.5

    def test_put_item_uses_correct_keys(self):
        mock_table = MagicMock()
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            favorites_service.save_favorite(_make_body())
        item = mock_table.put_item.call_args[1]["Item"]
        assert item["PK"] == "USER#guest"
        assert item["SK"] == "TICKER#AAPL"
        assert item["industry"] == "Technology"

    def test_metrics_stored_as_decimal(self):
        mock_table = MagicMock()
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            favorites_service.save_favorite(_make_body())
        item = mock_table.put_item.call_args[1]["Item"]
        assert isinstance(item["metrics"]["growth_rate"], Decimal)


class TestGetFavorites:
    def test_get_all_queries_by_pk(self):
        mock_table = MagicMock()
        mock_table.query.return_value = {"Items": [MOCK_DB_ITEM]}
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            results = favorites_service.get_favorites("guest")
        assert len(results) == 1
        assert results[0].ticker == "AAPL"

    def test_decimal_converted_to_float(self):
        mock_table = MagicMock()
        mock_table.query.return_value = {"Items": [MOCK_DB_ITEM]}
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            results = favorites_service.get_favorites("guest")
        assert results[0].metrics.growth_rate == 12.5
        assert isinstance(results[0].metrics.growth_rate, float)

    def test_get_by_industry_uses_gsi(self):
        mock_table = MagicMock()
        mock_table.query.return_value = {"Items": [MOCK_DB_ITEM]}
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            results = favorites_service.get_favorites("guest", industry="Technology")
        assert len(results) == 1
        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs["IndexName"] == "IndustryIndex"

    def test_empty_result_returns_empty_list(self):
        mock_table = MagicMock()
        mock_table.query.return_value = {"Items": []}
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            results = favorites_service.get_favorites("guest")
        assert results == []


class TestDeleteFavorite:
    def test_delete_calls_correct_key(self):
        mock_table = MagicMock()
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            favorites_service.delete_favorite("guest", "AAPL")
        mock_table.delete_item.assert_called_once_with(
            Key={"PK": "USER#guest", "SK": "TICKER#AAPL"}
        )

    def test_delete_returns_none(self):
        mock_table = MagicMock()
        with patch("backend.app.services.favorites_service.get_table", return_value=mock_table):
            result = favorites_service.delete_favorite("guest", "AAPL")
        assert result is None
