import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email.trim(), password);
      login(res.data.access_token, res.data.userId);
      navigate('/favorites');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail ?? 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser('demo@demo.com', 'demo1234');
      login(res.data.access_token, res.data.userId);
      navigate('/favorites');
    } catch {
      setError('Demo login unavailable. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-mark" style={{ fontSize: 24 }}>⬡</span>
          <h1 className="auth-title">SIGN IN</h1>
          <p className="auth-sub">Access your watchlist</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">PASSWORD</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'LOGIN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '12px 0 4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.05em' }}>OR</span>
        </div>

        <button
          className="auth-btn"
          type="button"
          disabled={loading}
          onClick={handleDemoLogin}
          style={{ background: '#4a4a4a', marginTop: 0 }}
        >
          {loading ? <span className="spinner" /> : 'DEMO LOGIN'}
        </button>

        <p className="auth-footer">
          No account?{' '}
          <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}
