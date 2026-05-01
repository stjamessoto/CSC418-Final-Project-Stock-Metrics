import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { isAuthenticated, userId, logout } = useAuth();

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
      <img src="/Group 17.svg"></img>
      </Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/favorites" className="nav-link">WATCHLIST</Link>
            <span className="nav-user">{userId?.split('@')[0]}</span>
            <button className="nav-logout" onClick={logout}>LOGOUT</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">LOGIN</Link>
            <Link to="/register" className="nav-link nav-register">REGISTER</Link>
          </>
        )}
      </div>
    </nav>
  );
}
