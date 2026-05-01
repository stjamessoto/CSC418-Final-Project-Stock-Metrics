// Field names match backend StockResponse: fifty_two_week_high / fifty_two_week_low
export default function MetricsCard({ data }: { data: Record<string, unknown> }) {
  const { ticker, growth_rate, pe_ratio, peg_ratio, fifty_two_week_high, fifty_two_week_low, industry } = data as {
    ticker: string;
    growth_rate: number;
    pe_ratio: number | null;
    peg_ratio: number | null;
    fifty_two_week_high: number | null;
    fifty_two_week_low: number | null;
    industry: string | null;
  };

  const lynchSignal = pe_ratio !== null && growth_rate > pe_ratio;

  const fmt = (val: number | null | undefined, suffix = '') =>
    val !== null && val !== undefined ? `${Number(val).toFixed(2)}${suffix}` : 'N/A';

  return (
    <div className="metrics-card">
      <div className="metrics-header">
        <div className="ticker-block">
          <span className="ticker-label">TICKER</span>
          <h2 className="ticker-symbol">{ticker}</h2>
          {industry && <span className="industry-tag">{industry}</span>}
        </div>
        {lynchSignal && (
          <div className="lynch-badge">
            <span className="lynch-dot" />
            LYNCH SIGNAL
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Growth Rate</span>
          <span className={`metric-value ${growth_rate > 0 ? 'positive' : 'negative'}`}>
            {fmt(growth_rate, '%')}
          </span>
          <span className="metric-sub">YoY Net Income</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">P/E Ratio</span>
          <span className="metric-value">{fmt(pe_ratio)}</span>
          <span className="metric-sub">Price / Earnings</span>
        </div>

        <div className={`metric-item ${lynchSignal ? 'peg-positive' : ''}`}>
          <span className="metric-label">Growth / P/E</span>
          <span className={`metric-value ${lynchSignal ? 'positive' : ''}`}>
            {fmt(peg_ratio)}
          </span>
          <span className="metric-sub">
            {lynchSignal ? '▲ Growth beats P/E' : 'Growth lags P/E'}
          </span>
        </div>
      </div>

      {(fifty_two_week_high || fifty_two_week_low) && (
        <div className="week-range">
          <span className="metric-label">52-Week Range</span>
          <div className="range-bar-wrapper">
            <span className="range-low">${fmt(fifty_two_week_low)}</span>
            <div className="range-bar"><div className="range-fill" /></div>
            <span className="range-high">${fmt(fifty_two_week_high)}</span>
          </div>
        </div>
      )}

      <div className={`lynch-summary ${lynchSignal ? 'lynch-good' : 'lynch-neutral'}`}>
        {lynchSignal
          ? '✓ Peter Lynch favors stocks where growth rate exceeds P/E — this one qualifies.'
          : '✗ Growth rate does not exceed P/E. Lynch would approach with caution.'}
      </div>
    </div>
  );
}
