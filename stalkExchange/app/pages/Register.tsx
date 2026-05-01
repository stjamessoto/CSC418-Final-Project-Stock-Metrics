import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(email.trim(), password);
      login(res.data.access_token, res.data.userId);
      navigate('/favorites');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">CREATE ACCOUNT</h1>
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
              placeholder="min. 6 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">CONFIRM PASSWORD</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'REGISTER'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
