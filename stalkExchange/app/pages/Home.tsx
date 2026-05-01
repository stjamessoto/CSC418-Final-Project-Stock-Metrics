import { useState } from 'react';
import SearchBar      from '../components/SearchBar';
import MetricsCard    from '../components/MetricsCard';
import ErrorModal     from '../components/ErrorModal';
import FavoriteButton from '../components/FavoriteButton';
import { fetchStock, fetchStockNews } from '../services/api';

type StockData = {
  ticker: string;
  growth_rate: number;
  pe_ratio: number | null;
  peg_ratio: number | null;
  industry: string | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
};

type NewsArticle = {
  title: string;
  publisher: string;
  link: string;
  published_at: string;
  thumbnail: string | null;
};

type ApiError = { ticker: string; message: string | null };

export default function Home() {
  const [loading, setLoading]     = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [news, setNews]           = useState<NewsArticle[]>([]);
  const [error, setError]         = useState<ApiError | null>(null);

  const handleSearch = async (ticker: string) => {
    setLoading(true);
    setStockData(null);
    setNews([]);
    setError(null);

    try {
      const [stockRes, newsRes] = await Promise.allSettled([
        fetchStock(ticker),
        fetchStockNews(ticker),
      ]);

      if (stockRes.status === 'rejected') {
        const e = stockRes.reason as { response?: { status: number; data?: { detail?: string } } };
        const status = e?.response?.status;
        const detail = e?.response?.data?.detail ?? null;
        setError({ ticker, message: status === 404 ? detail : 'An unexpected error occurred. Please try again.' });
        return;
      }

      setStockData(stockRes.value.data);

      if (newsRes.status === 'fulfilled') {
        setNews(newsRes.value.data.articles ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">

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

      {stockData && news.length > 0 && (
        <section className="news-section">
          <p className="news-section-title">Latest News — {stockData.ticker}</p>
          <div className="news-cards">
            {news.map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
              >
                {article.thumbnail ? (
                  <img src={article.thumbnail} alt="" className="news-thumb" />
                ) : (
                  <div className="news-thumb-placeholder">📰</div>
                )}
                <div className="news-content">
                  <span className="news-headline">{article.title}</span>
                  <span className="news-meta">
                    <span>{article.publisher}</span>
                    {article.published_at && (
                      <>
                        <span className="news-meta-sep">·</span>
                        <span>{article.published_at}</span>
                      </>
                    )}
                  </span>
                </div>
              </a>
            ))}
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

      <div className='Footer'>
  
          <h1 className='Credit'>Christian Johnson - UI/UX, Frontend</h1>
          <h1 className='Credit'>Seth Mack - Frontend</h1>
          <h1 className='Credit'>Nicholas Adams - Backend</h1>
          <h1 className='Credit'>Santiago Soto - Backend</h1>
          <h1 className='Credit'>FullStack Development - Spr 26</h1>
      </div>
    </div>

  );
}
