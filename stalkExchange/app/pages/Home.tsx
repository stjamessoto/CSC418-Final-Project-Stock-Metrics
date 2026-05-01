import { useState } from 'react';
import SearchBar      from '../components/SearchBar';
import MetricsCard    from '../components/MetricsCard';
import ErrorModal     from '../components/ErrorModal';
import FavoriteButton from '../components/FavoriteButton';
import { fetchStock } from '../services/api';

type StockData = {
  ticker: string;
  growth_rate: number;
  pe_ratio: number | null;
  peg_ratio: number | null;
  industry: string | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
};

type ApiError = { ticker: string; message: string | null };

export default function Home() {
  const [loading, setLoading]     = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError]         = useState<ApiError | null>(null);

  const handleSearch = async (ticker: string) => {
    setLoading(true);
    setStockData(null);
    setError(null);

    try {
      const res = await fetchStock(ticker);
      setStockData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { status: number; data?: { detail?: string } } };
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail ?? null;
      if (status === 404) {
        setError({ ticker, message: detail });
      } else {
        setError({ ticker, message: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="logo-block">
          <span className="logo-mark">⬡</span>
          <span className="logo-text">StalkExchange</span>
        </div>
        <p className="tagline">Peter Lynch–style metrics. One ticker at a time.</p>
      </header>

      <section className="search-section">
        <SearchBar onSearch={handleSearch} loading={loading} />
        <p className="search-hint">Enter a US market ticker symbol — e.g. AAPL, TSLA, MSFT</p>
      </section>

      {stockData && (
        <section className="results-section">
          <MetricsCard data={stockData} />
          <div className="results-actions">
            <FavoriteButton stockData={stockData} />
          </div>
        </section>
      )}

      {loading && (
        <section className="results-section">
          <div className="skeleton-card">
            <div className="sk sk-title" />
            <div className="sk-row">
              <div className="sk sk-metric" />
              <div className="sk sk-metric" />
              <div className="sk sk-metric" />
            </div>
            <div className="sk sk-bar" />
          </div>
        </section>
      )}

      {error && (
        <ErrorModal
          ticker={error.ticker}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
