import pytest
from app.services.stock_service import calculate_growth_rate


def test_growth_rate_calc():
    result = calculate_growth_rate(100, 150)
    assert result == 50.0


def test_growth_rate_negative_growth():
    result = calculate_growth_rate(200, 100)
    assert result == -50.0


def test_growth_rate_zero_previous_income():
    with pytest.raises(ValueError):
        calculate_growth_rate(0, 100)