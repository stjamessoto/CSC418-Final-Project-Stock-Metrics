import { useEffect } from 'react';

export default function ErrorModal({ ticker, message, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">⚠</div>
        <h3 className="modal-title">Ticker Not Found</h3>
        {ticker && (
          <p className="modal-ticker">
            <span className="modal-ticker-val">{ticker}</span> is not a recognised symbol.
          </p>
        )}
        <p className="modal-message">
          {message || 'Check the symbol and try again. Make sure you\'re using the correct US market ticker.'}
        </p>
        <button className="modal-close-btn" onClick={onClose}>
          DISMISS
        </button>
      </div>
    </div>
  );
}
