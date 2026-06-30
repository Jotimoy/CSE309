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
          <h1>Smart Todo</h1>
          <p>Frontend scaffold with React, TypeScript, and routing.</p>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;
