import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import ProtectedRoute from '../components/ProtectedRoute';
import IndustryFilter from '../components/IndustryFilter';
import { getFavorites, deleteFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Metrics = {
  growth_rate: number | null;
  pe_ratio: number | null;
  peg_ratio: number | null;
};

type FavoriteItem = {
  ticker: string;
  industry: string;
  userId: string;
  metrics: Metrics;
};

function FavoriteCard({ item, onDelete }: { item: FavoriteItem; onDelete: (ticker: string) => void }) {
  const { growth_rate, pe_ratio, peg_ratio } = item.metrics;
  const lynchSignal = pe_ratio !== null && growth_rate !== null && growth_rate > pe_ratio;
  const fmt = (v: number | null) => (v !== null && v !== undefined ? Number(v).toFixed(2) : 'N/A');

  return (
    <div className={`fav-card ${lynchSignal ? 'fav-card-signal' : ''}`}>
      <div className="fav-card-header">
        <div>
          <Link to={`/stock/${item.ticker}`} className="fav-card-ticker">{item.ticker}</Link>
          <span className="industry-tag">{item.industry}</span>
        </div>
        <div className="fav-card-actions">
          {lynchSignal && <span className="fav-signal-badge">LYNCH ▲</span>}
          <button
            className="fav-delete-btn"
            onClick={() => onDelete(item.ticker)}
            title="Remove from watchlist"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="fav-card-metrics">
        <div className="fav-metric">
          <span className="fav-metric-label">GROWTH</span>
          <span className={`fav-metric-value ${(growth_rate ?? 0) > 0 ? 'positive' : 'negative'}`}>
            {growth_rate !== null ? `${fmt(growth_rate)}%` : 'N/A'}
          </span>
        </div>
        <div className="fav-metric">
          <span className="fav-metric-label">P/E</span>
          <span className="fav-metric-value">{fmt(pe_ratio)}</span>
        </div>
        <div className="fav-metric">
          <span className="fav-metric-label">G/PE</span>
          <span className={`fav-metric-value ${lynchSignal ? 'positive' : ''}`}>{fmt(peg_ratio)}</span>
        </div>
      </div>

      <Link to={`/stock/${item.ticker}`} className="fav-detail-link">
        VIEW DETAIL →
      </Link>
    </div>
  );
}

function FavoritesContent() {
  const { userId } = useAuth();
  const [items, setItems]     = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState('');
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFavorites(userId || 'guest', industry || null);
      setItems(res.data);
    } catch {
      setError('Could not load watchlist. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [userId, industry]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (ticker: string) => {
    try {
      await deleteFavorite(ticker, userId || 'guest');
      setItems((prev) => prev.filter((i) => i.ticker !== ticker));
    } catch {
      setError('Could not remove item. Please try again.');
    }
  };

  return (
    <div className="fav-page">
      <div className="fav-page-header">
        <div>
          <h1 className="fav-page-title">WATCHLIST</h1>
          <p className="fav-page-sub">Your saved tickers with Lynch metrics</p>
        </div>
        <Link to="/" className="fav-back-btn">+ ADD TICKER</Link>
      </div>

      <IndustryFilter value={industry} onChange={setIndustry} />

      {loading && (
        <div className="fav-loading">
          <span className="spinner" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
          <span>Loading watchlist…</span>
        </div>
      )}

      {error && <p className="fav-error-msg">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="fav-empty">
          <p className="fav-empty-icon">☆</p>
          <p className="fav-empty-text">No favorites yet.</p>
          <p className="fav-empty-sub">Search a ticker on the home page and click FAVORITE.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="fav-grid">
          {items.map((item) => (
            <FavoriteCard key={item.ticker} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Favorites() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
