import os
import requests
import yfinance as yf
from fastapi import HTTPException


def calculate_growth_rate(previous_income, latest_income):
    if previous_income is None or latest_income is None:
        raise ValueError("Missing net income data")

    if previous_income == 0:
        raise ValueError("Previous income cannot be zero")

    return round(((latest_income - previous_income) / abs(previous_income)) * 100, 2)


def get_alpha_vantage_overview(ticker):
    api_key = os.getenv("alphaVantage")

    if not api_key:
        return {}

    url = "https://www.alphavantage.co/query"

    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": api_key,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def get_stock_metrics(ticker):
    ticker = ticker.upper()

    stock = yf.Ticker(ticker)

    try:
        info = stock.info
    except Exception:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    if not info or "symbol" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    financials = stock.financials

    if financials is None or financials.empty:
        raise HTTPException(status_code=404, detail=f"No financial data found for {ticker}")

    try:
        net_income_row = financials.loc["Net Income"]
        latest_income = net_income_row.iloc[0]
        previous_income = net_income_row.iloc[1]
        growth_rate = calculate_growth_rate(previous_income, latest_income)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Could not calculate growth rate for {ticker}")

    alpha_data = get_alpha_vantage_overview(ticker)

    pe_ratio = None
    industry = None

    try:
        pe_ratio = float(alpha_data.get("PERatio")) if alpha_data.get("PERatio") not in [None, "None", ""] else None
    except ValueError:
        pe_ratio = None

    if pe_ratio is None:
        pe_ratio = info.get("trailingPE")

    industry = alpha_data.get("Industry") or info.get("industry")

    peg_ratio = None
    if pe_ratio and growth_rate:
        peg_ratio = round(growth_rate / pe_ratio, 2)

    return {
        "ticker": ticker,
        "growth_rate": growth_rate,
        "pe_ratio": pe_ratio,
        "peg_ratio": peg_ratio,
        "industry": industry,
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
    }