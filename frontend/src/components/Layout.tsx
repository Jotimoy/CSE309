import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Smart AI Warehouse</h1>
          <p>Warehouse management UI built with React, TypeScript, and routing.</p>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main className="content">{children}</main>

      <footer className="site-footer">
        <div>
          <p>© 2026 Smart AI Warehouse. All rights reserved.</p>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
