import { useState } from 'react';

export default function SearchBar({ onSearch, loading }: { onSearch: (t: string) => void; loading: boolean }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = ticker.trim().toUpperCase();
    if (val) onSearch(val);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-wrapper">
        <span className="search-prefix">$</span>
        <input
          className="search-input"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="AAPL"
          maxLength={10}
          autoFocus
          spellCheck={false}
        />
        <button
          className="search-btn"
          type="submit"
          disabled={loading || !ticker.trim()}
        >
          {loading ? <span className="spinner" /> : 'QUERY'}
        </button>
      </div>
    </form>
  );
}
