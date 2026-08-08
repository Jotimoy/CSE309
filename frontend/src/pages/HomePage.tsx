import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="card home-hero">
      <div className="hero-copy">
        <span className="eyebrow">Warehouse Intelligence</span>
        <h2>Modern Warehouse Management for smarter operations</h2>
        <p>
          Optimize inventory, automate stock tracking, and gain real-time insights with
          an intelligent warehouse platform built for modern logistics teams.
        </p>
        <div className="hero-actions">
          <Link className="button-link primary-button" to="/login">
            Login
          </Link>
          <Link className="button-link" to="/register">
            Get started
          </Link>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h3>Inventory Visibility</h3>
          <p>Track stock movement across locations and avoid lost inventory with automated updates.</p>
        </article>
        <article className="feature-card">
          <h3>Smart Alerts</h3>
          <p>Receive alerts for low stock, shipment delays, and inventory discrepancies in realtime.</p>
        </article>
        <article className="feature-card">
          <h3>Fast Onboarding</h3>
          <p>Set up your warehouse workflows quickly and connect users with secure login control.</p>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
