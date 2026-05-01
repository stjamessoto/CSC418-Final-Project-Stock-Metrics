# StalkExchange — Stock Metrics App

A full-stack web application for searching US stocks and viewing key Peter Lynch–style investment metrics: Growth Rate, P/E Ratio, and PEG Ratio. Registered users can save a personal watchlist, filter by industry, and drill into detailed stock data.

**Stack:** FastAPI · React Router v7 + TypeScript · AWS DynamoDB · yfinance · Alpha Vantage · Docker

---

## Getting the Project

### Prerequisites

- [Git](https://git-scm.com/downloads)
- **To run with Docker (recommended):** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **To run manually:** Python 3.12+ and Node.js 20+

### Clone the repository

```bash
git clone https://github.com/stjamessoto/CSC418-Final-Project-Stock-Metrics.git
cd CSC418-Final-Project-Stock-Metrics
```

---

## Environment Setup

The backend reads a single `.env` file at the **project root**. Copy the example and fill in your credentials:

```bash
cp backend/.env.example .env
```

Then open `.env` and set the values:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=StockMetrics
alphaVantage=your_alpha_vantage_key
JWT_SECRET=any-long-random-string
```

| Variable | Where to get it |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS IAM console — create a user with DynamoDB access |
| `AWS_REGION` | The region your DynamoDB table is in (e.g. `us-east-1`) |
| `DYNAMODB_TABLE_NAME` | Leave as `StockMetrics` unless you rename the table |
| `alphaVantage` | [alphavantage.co](https://www.alphavantage.co/support/#api-key) — free tier gives 25 req/day |
| `JWT_SECRET` | Any random string (e.g. output of `openssl rand -hex 32`) |

> **DynamoDB table** — if you haven't created it yet, see the one-time provisioning step below under Manual Setup.

---

## Running with Docker (recommended)

Make sure Docker Desktop is running, then from the project root:

```bash
docker-compose up --build
```

That's it. Docker builds both images and starts the stack. On subsequent runs you can drop `--build`:

```bash
docker-compose up
```

| Service | URL |
|---|---|
| Frontend app | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

The frontend waits for the backend to pass its health check before starting, so startup order is handled automatically.

To stop everything:

```bash
docker-compose down
```

---

## Running Manually (without Docker)

You need **two terminals** running at the same time.

### Terminal 1 — Backend

```bash
# Create and activate a virtual environment
python -m venv backend/.venv

# Windows
backend\.venv\Scripts\activate

# macOS / Linux
source backend/.venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# One-time: provision the DynamoDB table (skip if it already exists)
python backend/scripts/create_table.py

# Start the server (run from project root)
uvicorn backend.app.main:app --reload --port 8000
```

Backend is live at http://localhost:8000

### Terminal 2 — Frontend

```bash
cd stalkExchange
npm install
npm run dev
```

Frontend is live at http://localhost:5173

---

## Using the App

1. **Home** (`/`) — search any US ticker symbol (e.g. `AAPL`, `TSLA`). Metrics and the Lynch signal appear immediately.
2. **Register** (`/register`) — create an account with email and password.
3. **Login** (`/login`) — sign in to access your watchlist.
4. **Watchlist** (`/favorites`) — view all saved tickers. Filter by industry, delete entries, or click a ticker to see its detail page.
5. **Stock Detail** (`/stock/:ticker`) — analyst price target, earnings date, market cap, beta, dividend yield, and 52-week range.

---

## API Reference

### Stock

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stock/{ticker}` | Growth Rate, P/E, PEG, 52-wk range, industry |
| `GET` | `/stock/{ticker}/detail` | Analyst target, earnings date, market cap, beta, volume, description |

**Example — `/stock/AAPL`:**
```json
{
  "ticker": "AAPL",
  "growth_rate": 12.5,
  "pe_ratio": 28.4,
  "peg_ratio": 2.27,
  "fifty_two_week_high": 199.62,
  "fifty_two_week_low": 124.17,
  "industry": "Technology"
}
```

### Favorites

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/favorites` | Save a stock to the watchlist |
| `GET` | `/favorites?userId=you@example.com` | List all saved stocks |
| `GET` | `/favorites?userId=you@example.com&industry=Technology` | Filter by industry |
| `DELETE` | `/favorites/{ticker}?userId=you@example.com` | Remove a saved stock |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account — returns JWT |
| `POST` | `/auth/login` | Sign in — returns JWT |

### Other

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — `{"status": "ok"}` |

---

## Running Tests

```bash
# Activate the virtual environment first, then from the project root:
pytest backend/tests/ -v
```

---

## Key Metrics Explained

| Metric | Formula | Source |
|---|---|---|
| **Growth Rate** | `(Net Income Y2 − Y1) / Y1 × 100` | yfinance annual financials |
| **P/E Ratio** | Price ÷ Earnings per share | Alpha Vantage OVERVIEW (fallback: yfinance) |
| **PEG Ratio** | `Growth Rate ÷ P/E` | Calculated |
| **Lynch Signal** | `Growth Rate > P/E` | Peter Lynch undervaluation indicator |

---

## Project Structure

```
CSC418-Final-Project-Stock-Metrics/
├── .env                          # Secrets — never commit this
├── docker-compose.yml            # Runs backend + frontend together
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS config
│   │   ├── routes/
│   │   │   ├── stocks.py         # GET /stock/{ticker} and /detail
│   │   │   ├── favorites.py      # POST/GET/DELETE /favorites
│   │   │   └── auth.py           # POST /auth/register, /auth/login
│   │   ├── services/
│   │   │   ├── stock_service.py  # yfinance + Alpha Vantage logic
│   │   │   └── favorites_service.py
│   │   ├── models/
│   │   │   ├── stock.py
│   │   │   ├── favorite.py
│   │   │   └── user.py
│   │   └── db/
│   │       └── dynamo.py         # boto3 DynamoDB client factory
│   ├── scripts/
│   │   └── create_table.py       # One-time DynamoDB table setup
│   └── tests/
│       ├── test_stock_service.py
│       └── test_favorites_service.py
└── stalkExchange/                # React Router v7 frontend
    ├── Dockerfile
    ├── package.json
    ├── app/
    │   ├── root.tsx              # Global layout, AuthProvider, NavBar
    │   ├── routes.ts             # Route definitions
    │   ├── app.css               # Global styles (dark terminal theme)
    │   ├── context/
    │   │   └── AuthContext.tsx   # JWT token state
    │   ├── pages/
    │   │   ├── Home.tsx          # Search page
    │   │   ├── Favorites.tsx     # Watchlist dashboard
    │   │   ├── StockDetail.tsx   # Deep-dive stock page
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── components/
    │   │   ├── MetricsCard.tsx
    │   │   ├── FavoriteButton.tsx
    │   │   ├── IndustryFilter.tsx
    │   │   ├── NavBar.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── SearchBar.tsx
    │   └── services/
    │       └── api.ts            # Axios client with auth interceptor
    └── react-router.config.ts
```

---

## Team

| Name | Tickets |
|---|---|
| Christian Johnson | T1 — Infrastructure & project setup |
| Nicholas Adams | T2 — Stock metrics API |
| Nicholas Adams | T3 — Favorites API + DynamoDB |
| Seth Mack | T4 — Core frontend (search, metrics card, UI theme) |
| Santiago Soto | T5 — Favorites dashboard + Stock detail page |
| All | T6 — Auth (JWT), Docker, polish |
