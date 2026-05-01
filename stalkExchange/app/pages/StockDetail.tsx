import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import ProtectedRoute from '../components/ProtectedRoute';
import { getStockDetail } from '../services/api';

type DetailData = {
  ticker: string;
  company_name: string | null;
  analyst_target_price: number | null;
  earnings_date: string | null;
  sector: string | null;
  description: string | null;
  market_cap: number | null;
  volume: number | null;
  avg_volume: number | null;
  dividend_yield: number | null;
  beta: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
};

function fmtNum(v: number | null, decimals = 2): string {
  if (v === null || v === undefined) return 'N/A';
  return Number(v).toFixed(decimals);
}

function fmtLarge(v: number | null): string {
  if (v === null || v === undefined) return 'N/A';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
}

function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="detail-panel">
      <h3 className="detail-panel-title">{title}</h3>
      {children}
    </div>
  );
}

function DetailStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="detail-stat">
      <span className="detail-stat-label">{label}</span>
      <span className={`detail-stat-value ${accent ? 'positive' : ''}`}>{value}</span>
    </div>
  );
}

function StockDetailContent() {
  const { ticker } = useParams<{ ticker: string }>();
  const [data, setData]     = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    getStockDetail(ticker)
      .then((res) => setData(res.data))
      .catch(() => setError(`Could not load detail for ${ticker}.`))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="fav-loading">
          <span className="spinner" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
          <span>Loading {ticker}…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="detail-page">
        <p className="fav-error-msg">{error ?? 'Unknown error'}</p>
        <Link to="/favorites" className="fav-back-btn" style={{ marginTop: 16 }}>← BACK</Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <Link to="/favorites" className="detail-back">← WATCHLIST</Link>
          <h1 className="detail-ticker">{data.ticker}</h1>
          {data.company_name && <p className="detail-company">{data.company_name}</p>}
          <div className="detail-tags">
            {data.sector && <span className="industry-tag">{data.sector}</span>}
          </div>
        </div>
        {data.analyst_target_price && (
          <div className="detail-target">
            <span className="detail-target-label">ANALYST TARGET</span>
            <span className="detail-target-value">${fmtNum(data.analyst_target_price)}</span>
          </div>
        )}
      </div>

      {data.description && (
        <p className="detail-description">{data.description}</p>
      )}

      <div className="detail-panels">
        <DetailPanel title="KEY METRICS">
          <DetailStat label="Market Cap"      value={fmtLarge(data.market_cap)} />
          <DetailStat label="Beta"            value={fmtNum(data.beta)} />
          <DetailStat label="Dividend Yield"  value={data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : 'N/A'} />
          <DetailStat label="52-Wk High"      value={data.fifty_two_week_high ? `$${fmtNum(data.fifty_two_week_high)}` : 'N/A'} />
          <DetailStat label="52-Wk Low"       value={data.fifty_two_week_low  ? `$${fmtNum(data.fifty_two_week_low)}`  : 'N/A'} />
        </DetailPanel>

        <DetailPanel title="VOLUME">
          <DetailStat label="Today's Volume"  value={data.volume ? Number(data.volume).toLocaleString() : 'N/A'} />
          <DetailStat label="Avg Volume"      value={data.avg_volume ? Number(data.avg_volume).toLocaleString() : 'N/A'} />
        </DetailPanel>

        <DetailPanel title="EARNINGS">
          <DetailStat
            label="Next Earnings"
            value={data.earnings_date ?? 'N/A'}
            accent={!!data.earnings_date}
          />
          {data.analyst_target_price && (
            <DetailStat
              label="Price Target"
              value={`$${fmtNum(data.analyst_target_price)}`}
              accent
            />
          )}
        </DetailPanel>
      </div>
    </div>
  );
}

export default function StockDetail() {
  return (
    <ProtectedRoute>
      <StockDetailContent />
    </ProtectedRoute>
  );
}
