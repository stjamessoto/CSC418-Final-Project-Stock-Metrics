# Stock Metrics App (StalkExchange)

A full-stack web application for searching stocks and viewing key investment metrics — Growth Rate, P/E Ratio, and PEG Ratio — with the ability to save favorites and filter by industry.

**Stack:** FastAPI (Python) · React Router v7 + TypeScript · Tailwind CSS v4 · AWS DynamoDB · yfinance · Alpha Vantage

---

## Project Structure

```
stock-metrics/
├── .env                          # Root env file — shared by backend
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point, CORS config
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
└── stalkExchange/               # Frontend — React Router v7 + TypeScript
    ├── app/
    │   ├── routes/
    │   │   ├── home.tsx          # Landing / search page
    │   │   └── stocks.tsx        # Stock metrics display
    │   ├── root.tsx
    │   ├── routes.ts
    │   └── app.css
    ├── stalkVenv/               # Python venv (if using from here)
    ├── react-router.config.ts
    ├── package.json
    └── Dockerfile
```

---

## Environment Variables

There is a single `.env` at the project root used by the backend. Copy and fill in:

```bash
cp backend/.env.example .env
```

| Variable | Description |
|---|---|
| `alphaVantage` | Alpha Vantage API key (free: 25 req/day) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | DynamoDB region (e.g. `us-east-1`) |
| `DYNAMODB_TABLE_NAME` | Table name (default: `StockMetrics`) |

> The `alphaVantage` key is already set in `.env`. Add the AWS credentials to enable DynamoDB.

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
# From project root or stalkExchange/
python -m venv stalkExchange/stalkVenv

# Windows
stalkExchange\stalkVenv\Scripts\activate

# macOS / Linux
source stalkExchange/stalkVenv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Provision the DynamoDB table (run once)

```bash
python -m backend.scripts.create_table
```

This creates:
- **Table:** `StockMetrics`
  - PK: `USER#{userId}` (partition key)
  - SK: `TICKER#{ticker}` (sort key)
- **GSI:** `IndustryIndex` — PK: `industry` (enables `/favorites?industry=` queries)

### 4. Start the backend

Run from the **project root**:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Frontend Setup (stalkExchange)

```bash
cd stalkExchange
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

The frontend makes API calls to `http://localhost:8000` (backend must be running).

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
pytest backend/tests/ -v
```

---

## Key Metrics Explained

- **Growth Rate** — `[(Net Income Y2 - Net Income Y1) / Net Income Y1] * 100` (2-year trailing, via yfinance)
- **P/E Ratio** — Price-to-Earnings ratio (Alpha Vantage OVERVIEW or yfinance)
- **PEG Ratio** — `Growth Rate / P/E` — Peter Lynch's primary valuation signal
- **Lynch Signal** — displayed when `Growth Rate > P/E` (Lynch's favored undervaluation condition)

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
| Seth Mack | T4 (Core Frontend) + T6 Frontend Auth/Polish |
| Santiago Soto | T5 (Favorites Dashboard + Stock Detail) |
