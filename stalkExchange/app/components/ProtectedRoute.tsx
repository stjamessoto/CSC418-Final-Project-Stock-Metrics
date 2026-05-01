import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // login() writes to localStorage synchronously before the React state update
  // commits, so on the first render after navigate('/favorites') the context
  // token may still be null. Fall back to localStorage as the ground truth.
  const hasToken =
    isAuthenticated ||
    (typeof window !== 'undefined' && !!localStorage.getItem('token'));

  useEffect(() => {
    if (!hasToken) navigate('/login', { replace: true });
  }, [hasToken, navigate]);

  if (!hasToken) return null;
  return <>{children}</>;
}
