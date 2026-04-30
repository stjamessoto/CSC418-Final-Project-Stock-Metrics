import { useState } from 'react';
import SearchBar     from '../components/SearchBar';
import MetricsCard   from '../components/MetricsCard';
import ErrorModal    from '../components/ErrorModal';
import FavoriteButton from '../components/FavoriteButton';
import { fetchStock } from '../services/api';

export default function Home() {
  const [loading, setLoading]   = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError]       = useState(null);
  const [lastTicker, setLastTicker] = useState('');

  const handleSearch = async (ticker) => {
    setLoading(true);
    setStockData(null);
    setError(null);
    setLastTicker(ticker);

    try {
      const res = await fetchStock(ticker);
      setStockData(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 404) {
        setError({ ticker, message: detail || null });
      } else {
        setError({ ticker, message: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero */}
      <header className="home-header">
        <div className="logo-block">
          <span className="logo-mark">⬡</span>
          <span className="logo-text">StalkExchange</span>
        </div>
        <p className="tagline">
          Peter Lynch–style metrics. One ticker at a time.
        </p>
      </header>

      {/* Search */}
      <section className="search-section">
        <SearchBar onSearch={handleSearch} loading={loading} />
        <p className="search-hint">Enter a US market ticker symbol — e.g. AAPL, TSLA, MSFT</p>
      </section>

      {/* Results */}
      {stockData && (
        <section className="results-section">
          <MetricsCard data={stockData} />
          <div className="results-actions">
            <FavoriteButton stockData={stockData} />
          </div>
        </section>
      )}

      {/* Loading skeleton */}
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

      {/* Error modal */}
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
