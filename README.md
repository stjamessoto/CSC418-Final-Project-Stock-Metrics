# Stock Metrics App

A full-stack web application for searching stocks and viewing key investment metrics — Growth Rate, P/E Ratio, and PEG Ratio — with the ability to save favorites and filter by industry.

**Stack:** FastAPI (Python) · React + Vite · Tailwind CSS · AWS DynamoDB · yfinance · Alpha Vantage

---

## Project Structure

```
stock-metrics/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point, CORS config
│   │   ├── routes/
│   │   │   ├── stocks.py        # GET /stock/{ticker}
│   │   │   ├── favorites.py     # POST/GET/DELETE /favorites
│   │   │   └── auth.py          # POST /auth/register, /auth/login
│   │   ├── services/
│   │   │   ├── stock_service.py # yfinance + Alpha Vantage logic
│   │   │   └── favorites_service.py
│   │   ├── models/
│   │   │   ├── stock.py         # Pydantic response models
│   │   │   └── favorite.py
│   │   ├── db/
│   │   │   └── dynamo.py        # boto3 DynamoDB client
│   │   └── middleware/
│   │       └── auth_middleware.py
│   ├── scripts/
│   │   └── create_table.py      # One-time DynamoDB table provisioning
│   ├── tests/
│   │   ├── test_stock_service.py
│   │   └── test_favorites_service.py
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx          # Search page
    │   │   ├── Favorites.jsx     # Saved stocks dashboard
    │   │   ├── StockDetail.jsx   # Deep-dive single stock page
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── components/
    │   │   ├── SearchBar.jsx
    │   │   ├── MetricsCard.jsx   # Growth Rate, P/E, PEG + Lynch signal badge
    │   │   ├── FavoriteButton.jsx
    │   │   ├── ErrorModal.jsx
    │   │   ├── IndustryFilter.jsx
    │   │   ├── PeersPanel.jsx
    │   │   ├── EarningsPanel.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance, all HTTP calls
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- AWS account with DynamoDB access
- [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) (free tier: 25 req/day)

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | DynamoDB region (e.g. `us-east-1`) |
| `DYNAMODB_TABLE_NAME` | Table name (default: `StockMetrics`) |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage key for P/E + industry data |

### 4. Provision the DynamoDB table

Run once to create the table and GSI:

```bash
python -m backend.scripts.create_table
```

This creates:
- **Table:** `StockMetrics`
  - PK: `USER#{userId}` (partition key)
  - SK: `TICKER#{ticker}` (sort key)
- **GSI:** `IndustryIndex` — PK: `industry` (for industry-based filtering)

### 5. Start the backend

```bash
uvicorn backend.app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

All `/api/*` requests are proxied to the backend at `http://localhost:8000` via `vite.config.js`.

---

## API Reference

### Stock Metrics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stock/{ticker}` | Returns Growth Rate, P/E, PEG, 52-wk high/low, industry |

**Example response:**
```json
{
  "ticker": "AAPL",
  "growth_rate": 12.5,
  "pe_ratio": 28.4,
  "peg_ratio": 2.27,
  "week_52_high": 199.62,
  "week_52_low": 124.17,
  "industry": "Technology"
}
```

Returns `404` with `{"detail": "Ticker not found"}` for invalid tickers.

### Favorites

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/favorites` | Save a stock to favorites |
| `GET` | `/favorites` | List all favorited stocks |
| `GET` | `/favorites?industry=Technology` | Filter favorites by industry (via GSI) |
| `DELETE` | `/favorites/{ticker}` | Remove a favorited stock |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Login and receive JWT |

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Key Metrics Explained

- **Growth Rate** — `[(Net Income Y2 - Net Income Y1) / Net Income Y1] * 100` (2-year trailing, via yfinance)
- **P/E Ratio** — Price-to-Earnings ratio (Alpha Vantage OVERVIEW or yfinance)
- **PEG Ratio** — `Growth Rate / P/E` — Peter Lynch's primary valuation signal; PEG < 1 suggests undervalued
- **Lynch Signal** — Badge shown when `Growth Rate > P/E` (Lynch's favored condition)

---

## Branching Strategy

```
main        ← stable, demo-ready
dev         ← integration branch
feature/*   ← individual ticket work (e.g. feature/ticket-2-stock-api)
```

Open PRs against `dev`. Merge `dev` → `main` only when integrated and tested.

---

## Team

| Person | Tickets |
|---|---|
| Christian Johnson | T1 (Infra) + T6 Backend Auth |
| Nicholas Adams | T2 (Stock API) + T3 (Favorites API) |
| Seth Mack | T4 (Core Frontend) + T6 Frontend Auth |
| Santiago Soto | T5 (Favorites Dashboard + Stock Detail) |
