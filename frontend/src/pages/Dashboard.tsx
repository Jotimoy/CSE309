import { useEffect, useState } from 'react';
import { getSummary } from '../services/api';
import { ItemIcon, AlertIcon, LocationIcon } from '../components/Icons';

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

  const refresh = () => {
    setLoading(true);
    setError('');
    getSummary()
      .then((s) => setSummary(s))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="auth-error">{error}</p>;
  if (!summary) return null;

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero card">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Inventory Dashboard</h2>
          <p className="panel-copy">Quick snapshot of inventory health, recent movements and alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={refresh} className="button-link primary-button">Refresh</button>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-2">
        <div className="dashboard-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="icon-square"><ItemIcon /></div>
              <div>
                <p>Total items</p>
                <h3>{summary.total_items}</h3>
                <p className="panel-copy">Unique items tracked in the system</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="icon-square"><AlertIcon /></div>
              <div>
                <p>Low stock</p>
                <h3>{summary.low_stock_count}</h3>
                <p className="panel-copy">Items with stock below threshold</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="icon-square"><LocationIcon /></div>
              <div>
                <p>Recent movements</p>
                <h3>{summary.recent_movements.length}</h3>
                <p className="panel-copy">Recent stock movements</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-header">
              <h3>Recent Movements</h3>
            </div>
            <div>
              {summary.recent_movements.length === 0 ? (
                <p className="panel-copy">No recent movements</p>
              ) : (
                <ul className="task-overview">
                  {summary.recent_movements.map((m: any) => (
                    <li className="task-item" key={m.id}>
                      <div>
                        <strong>Item {m.item_id}</strong>
                        <p className="panel-copy">Qty {m.quantity} — {m.created_at}</p>
                      </div>
                      <div className="badge pending">Movement</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ height: '1rem' }} />

          <div className="panel">
            <div className="panel-header">
              <h3>Low Stock Items</h3>
            </div>
            <div>
              {summary.low_stock.length === 0 ? (
                <p className="panel-copy">All items healthy</p>
              ) : (
                <ul className="task-card-list">
                  {summary.low_stock.map((l: any) => (
                    <li className="task-card" key={`${l.item_id}-${l.location_id}`}>
                      <div>
                        <strong>{l.name} ({l.sku})</strong>
                        <p className="panel-copy">{l.quantity} @ location {l.location_id}</p>
                      </div>
                      <div className="badge pending">Low</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
