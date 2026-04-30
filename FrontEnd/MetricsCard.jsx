export default function MetricsCard({ data, onFavorite }) {
  const { ticker, growth_rate, pe_ratio, peg_ratio, week_52_high, week_52_low, industry } = data;

  // Lynch signal: growth > P/E means the stock is potentially undervalued
  const lynchSignal = growth_rate > pe_ratio;

  const fmt = (val, suffix = '') =>
    val !== null && val !== undefined ? `${Number(val).toFixed(2)}${suffix}` : 'N/A';

  return (
    <div className="metrics-card">
      {/* Header */}
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

      {/* Core metrics grid */}
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

      {/* 52-week range */}
      {(week_52_high || week_52_low) && (
        <div className="week-range">
          <span className="metric-label">52-Week Range</span>
          <div className="range-bar-wrapper">
            <span className="range-low">${fmt(week_52_low)}</span>
            <div className="range-bar">
              <div className="range-fill" />
            </div>
            <span className="range-high">${fmt(week_52_high)}</span>
          </div>
        </div>
      )}

      {/* Lynch explanation */}
      <div className={`lynch-summary ${lynchSignal ? 'lynch-good' : 'lynch-neutral'}`}>
        {lynchSignal
          ? '✓ Peter Lynch favors stocks where growth rate exceeds P/E — this one qualifies.'
          : '✗ Growth rate does not exceed P/E. Lynch would approach with caution.'}
      </div>
    </div>
  );
}
