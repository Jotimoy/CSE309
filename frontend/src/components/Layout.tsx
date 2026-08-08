import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const auth = (() => {
    try {
      return useAuth();
    } catch {
      return null;
    }
  })();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Smart AI Warehouse</h1>
          <p>Warehouse management UI built with React, TypeScript, and routing.</p>
        </div>
        <nav className="nav-links">
          {auth && auth.isAuthenticated ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/inventory">Inventory</Link>
              <Link to="/alerts">Alerts</Link>
              <button className="button-link" onClick={handleLogout}>
                Logout
              </button>
              <span className="muted">{auth.user?.name}</span>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="content">{children}</main>

      {/* Footer removed per user request */}
    </div>
  );
}

export default Layout;
