import { useEffect, useState } from 'react';
import { listAlerts, resolveAlert } from '../services/api';

function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await listAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (id: number) => {
    if (!confirm('Resolve this alert?')) return;
    try {
      await resolveAlert(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="card">
      <h2>Alerts</h2>
      <p>System generated alerts (low stock, discrepancies).</p>

      {loading && <p>Loading...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <ul className="alerts-list">
          {alerts.map((a) => (
            <li key={a.id} className={`alert-item ${a.is_resolved ? 'resolved' : ''}`}>
              <div>
                <strong>{a.type}</strong> — {a.message}
                <div className="muted">{a.created_at}</div>
              </div>
              {!a.is_resolved && (
                <div>
                  <button className="button-link" onClick={() => handleResolve(a.id)}>Resolve</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AlertsPage;
