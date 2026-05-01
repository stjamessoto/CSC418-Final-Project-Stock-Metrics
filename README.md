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

The backend reads a single `.env` file at the **project root**. Create it and fill in your credentials:

```bash
# macOS / Linux
cp backend/.env.example .env

# Windows (PowerShell)
Copy-Item backend\.env.example .env
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
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS IAM console — create a user with DynamoDB full access |
| `AWS_REGION` | The region your DynamoDB table is in (e.g. `us-east-1`) |
| `DYNAMODB_TABLE_NAME` | Leave as `StockMetrics` unless you rename the table |
| `alphaVantage` | [alphavantage.co](https://www.alphavantage.co/support/#api-key) — free tier gives 25 req/day |
| `JWT_SECRET` | Any random string (e.g. output of `openssl rand -hex 32`) |

---

## One-Time: Provision the DynamoDB Table

> Skip this step if the table already exists in your AWS account.

The app stores favorites and user accounts in a single DynamoDB table. You must create it before running the app for the first time.

```bash
# Activate your Python virtual environment first (see Manual Setup below),
# then run from the project root:
python backend/scripts/create_table.py
```

This creates the `StalkMetrics` table with the required partition key, sort key, and `IndustryIndex` GSI. The script is idempotent — running it twice is safe.

---

## Running with Docker (recommended)

> Make sure Docker Desktop is **running** before you proceed.

From the project root:

```bash
docker-compose up --build
```

Docker builds both images and starts the full stack. The frontend waits for the backend health check before starting, so startup order is handled automatically.

On subsequent runs you can omit `--build`:

```bash
docker-compose up
```

| Service | URL |
|---|---|
| Frontend app | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

To stop everything:

```bash
docker-compose down
```

> **DynamoDB with Docker:** Docker does not provision DynamoDB for you. You must still create the table in your AWS account (see above) and set all AWS credentials in `.env` before running `docker-compose up`.

---

## Running Manually (without Docker)

> **You need two separate terminal windows open at the same time** — one for the backend and one for the frontend. Both must be running simultaneously for the app to work.

### Terminal 1 — Backend

```bash
# 1. Create a virtual environment inside the backend folder
python -m venv backend/.venv

# 2. Activate it
#    Windows (PowerShell):
backend\.venv\Scripts\Activate.ps1
#    Windows (Command Prompt):
backend\.venv\Scripts\activate.bat
#    macOS / Linux:
source backend/.venv/bin/activate

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. One-time only: provision the DynamoDB table
python backend/scripts/create_table.py

# 5. Start the API server (run from the project root, NOT from inside backend/)
uvicorn backend.app.main:app --reload --port 8000
```

Leave this terminal running. The backend is live at **http://localhost:8000**

### Terminal 2 — Frontend

Open a **new** terminal window (keep Terminal 1 running):

```bash
cd stalkExchange
npm install
npm run dev
```

Leave this terminal running. The frontend is live at **http://localhost:5173**

> Both terminals must stay open for the full app to work. Closing either one will break the other.

---

## Using the App

1. **Home** (`/`) — search any US ticker symbol (e.g. `AAPL`, `TSLA`). Metrics and the Lynch signal appear immediately.
2. **Register** (`/register`) — create an account with email and password.
3. **Login** (`/login`) — sign in to access your watchlist. Use **DEMO LOGIN** to try without registering.
4. **Watchlist** (`/favorites`) — view all saved tickers. Filter by industry, delete entries, or click a ticker to see its detail page.
5. **Stock Detail** (`/stock/:ticker`) — analyst price target, earnings date, market cap, beta, dividend yield, and 52-week range.
6. **Dark / Light mode** — toggle the slider in the top-right corner of the nav bar. Your preference is saved automatically.

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
    │   ├── root.tsx              # Global layout, ThemeProvider, AuthProvider, NavBar
    │   ├── routes.ts             # Route definitions
    │   ├── app.css               # Global styles (light default, dark mode via data-theme)
    │   ├── context/
    │   │   ├── AuthContext.tsx   # JWT token state
    │   │   └── ThemeContext.tsx  # Light/dark theme toggle with localStorage persistence
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
| Santiago Soto | T3 — Favorites API + DynamoDB |
| Seth Mack | T4 — Core frontend (search, metrics card, UI theme) |
| Santiago Soto | T5 — Favorites dashboard + Stock detail page |
| All | T6 — Auth (JWT), Docker, polish |
