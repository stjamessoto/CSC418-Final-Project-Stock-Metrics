import os
from datetime import datetime
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
        peg_ratio = round(pe_ratio / growth_rate, 2)

    return {
        "ticker": ticker,
        "growth_rate": growth_rate,
        "pe_ratio": pe_ratio,
        "peg_ratio": peg_ratio,
        "industry": industry,
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
    }


def get_stock_news(ticker: str) -> dict:
    ticker = ticker.upper()
    stock = yf.Ticker(ticker)

    try:
        raw_news = stock.news or []
    except Exception:
        return {"ticker": ticker, "articles": []}

    articles = []
    for item in raw_news[:8]:
        # yfinance 1.x nests fields under "content"; older versions use a flat structure
        content = item.get("content") or item

        title = content.get("title", "")

        provider = content.get("provider", {})
        publisher = (
            provider.get("displayName", "") if isinstance(provider, dict) else ""
        ) or content.get("publisher", "")

        canonical = content.get("canonicalUrl", {})
        link = (
            canonical.get("url", "") if isinstance(canonical, dict) else ""
        ) or content.get("link", "")

        published_at = ""
        pub_date = content.get("pubDate", "")
        if pub_date:
            try:
                dt = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                published_at = dt.strftime("%b %d, %Y")
            except Exception:
                pass
        else:
            ts = content.get("providerPublishTime")
            if ts:
                try:
                    published_at = datetime.fromtimestamp(float(ts)).strftime("%b %d, %Y")
                except Exception:
                    pass

        thumbnail = None
        try:
            for src in (content, item):
                thumb = src.get("thumbnail", {})
                if isinstance(thumb, dict):
                    resolutions = thumb.get("resolutions", [])
                    if resolutions:
                        thumbnail = resolutions[0].get("url")
                        break
        except Exception:
            pass

        if title or link:
            articles.append({
                "title": title,
                "publisher": publisher,
                "link": link,
                "published_at": published_at,
                "thumbnail": thumbnail,
            })

    return {"ticker": ticker, "articles": articles}


def get_stock_detail(ticker: str) -> dict:
    ticker = ticker.upper()
    stock = yf.Ticker(ticker)

    try:
        info = stock.info
    except Exception:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    if not info or "symbol" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    earnings_date = None
    try:
        cal = stock.calendar
        if isinstance(cal, dict):
            dates = cal.get("Earnings Date")
            if dates:
                d = dates[0] if isinstance(dates, list) else dates
                earnings_date = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)
    except Exception:
        pass

    if not earnings_date:
        ts = info.get("nextEarningsDate") or info.get("earningsTimestamp")
        if ts:
            try:
                earnings_date = datetime.fromtimestamp(float(ts)).strftime("%Y-%m-%d")
            except Exception:
                pass

    description = info.get("longBusinessSummary") or None
    if description and len(description) > 420:
        description = description[:420] + "…"

    return {
        "ticker": ticker,
        "company_name": info.get("longName"),
        "analyst_target_price": info.get("targetMeanPrice"),
        "earnings_date": earnings_date,
        "sector": info.get("sector"),
        "description": description,
        "market_cap": info.get("marketCap"),
        "volume": info.get("volume"),
        "avg_volume": info.get("averageVolume"),
        "dividend_yield": info.get("dividendYield"),
        "beta": info.get("beta"),
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
    }