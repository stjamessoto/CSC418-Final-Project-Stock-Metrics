import { useState } from 'react';
import { addFavorite } from '../services/api';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Discretionary',
  'Automotive', 'Energy', 'Real Estate', 'Utilities',
  'Industrials', 'Materials', 'Communication Services', 'Other',
];

export default function FavoriteButton({ stockData }) {
  const [open, setOpen]       = useState(false);
  const [industry, setIndustry] = useState(stockData?.industry || '');
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const handleStar = () => {
    if (saved) return;
    setOpen((prev) => !prev);
  };

  const handleSave = async () => {
    if (!industry) return;
    setSaving(true);
    setError(null);
    try {
      await addFavorite({
        ticker:     stockData.ticker,
        industry,
        growth_rate: stockData.growth_rate,
        pe_ratio:    stockData.pe_ratio,
        peg_ratio:   stockData.peg_ratio,
        userId:      'guest', // replaced once auth (T6) is wired in
      });
      setSaved(true);
      setOpen(false);
    } catch (err) {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fav-wrapper">
      <button
        className={`fav-btn ${saved ? 'fav-saved' : ''}`}
        onClick={handleStar}
        title={saved ? 'Saved to favorites' : 'Add to favorites'}
      >
        {saved ? '★ SAVED' : '☆ FAVORITE'}
      </button>

      {open && !saved && (
        <div className="fav-dropdown">
          <p className="fav-dropdown-label">Select industry to save</p>
          <select
            className="fav-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">— pick industry —</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          {error && <p className="fav-error">{error}</p>}
          <div className="fav-actions">
            <button className="fav-cancel" onClick={() => setOpen(false)}>Cancel</button>
            <button
              className="fav-save-btn"
              onClick={handleSave}
              disabled={!industry || saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
