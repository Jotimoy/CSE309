import { useEffect, useState } from 'react';
import { getSummary } from '../services/api';

function Dashboard() {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getSummary()
      .then((s) => setSummary(s))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="auth-error">{error}</p>;
  if (!summary) return null;

  return (
    <section className="card">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="widget">
          <h3>Total items</h3>
          <div className="stat">{summary.total_items}</div>
        </div>

        <div className="widget">
          <h3>Low stock</h3>
          <div className="stat">{summary.low_stock_count}</div>
        </div>

        <div className="widget wide">
          <h3>Recent movements</h3>
          <ul>
            {summary.recent_movements.map((m: any) => (
              <li key={m.id}>{m.created_at}: item {m.item_id} qty {m.quantity}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3>Low stock items</h3>
      <ul>
        {summary.low_stock.map((l: any) => (
          <li key={`${l.item_id}-${l.location_id}`}>{l.name} ({l.sku}) — {l.quantity} @ location {l.location_id}</li>
        ))}
      </ul>
    </section>
  );
}

export default Dashboard;
