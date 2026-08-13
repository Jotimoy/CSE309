import { useEffect, useState } from 'react';
import { listItems, createItem, listLocations, createLocation, setStock, deleteItem } from '../services/api';
import type { Item, Location } from '../types';
import { Link } from 'react-router-dom';
import { ItemIcon, LocationIcon } from '../components/Icons';

function InventoryList() {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('');
  const [initialQuantity, setInitialQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([listItems(), listLocations()])
      .then(([itemsData, locs]) => {
        if (!mounted) return;
        setItems(itemsData);
        setLocations(locs);
        if (locs.length > 0) setSelectedLocation(locs[0].id);
      })
      .catch((err) => {
        if (!mounted) return;
        setPageError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setSku('');
    setName('');
    setDescription('');
    setUnit('');
    setSelectedLocation(locations.length > 0 ? locations[0].id : null);
    setCreatingLocation(false);
    setNewLocationName('');
    setNewLocationType('');
    setInitialQuantity(0);
  };

  const currentError = showForm ? formError : pageError;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!sku.trim() || !name.trim()) {
      setFormError('SKU and name are required.');
      return;
    }

    if (creatingLocation && !newLocationName.trim()) {
      setFormError('New location name is required.');
      return;
    }

    if (!selectedLocation && !creatingLocation) {
      setFormError('Please select an existing location or create a new one.');
      return;
    }

    setIsSubmitting(true);
    try {
      let locationId = selectedLocation;
      if (creatingLocation) {
        const location = await createLocation({ name: newLocationName.trim(), type: newLocationType.trim() || undefined });
        locationId = location.id;
        setLocations((prev) => [...prev, location]);
      }

      const newItem = await createItem({ sku, name, description, unit });
      if (locationId && initialQuantity > 0) {
        await setStock(newItem.id, locationId, initialQuantity);
      }

      setItems((prev) => [newItem, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else if (typeof err === 'string') {
        setFormError(err);
      } else {
        setFormError(JSON.stringify(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero card">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Items</h2>
          <p className="panel-copy">Manage items, stock and locations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="button-link" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : 'Add item'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="auth-form" onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <label>
            SKU
            <input value={sku} onChange={(e) => setSku(e.target.value)} required />
          </label>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Unit
            <input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label>
              Location
              <select
                value={selectedLocation ?? ''}
                disabled={creatingLocation}
                onChange={(e) => setSelectedLocation(Number(e.target.value))}
              >
                <option value="" disabled>
                  Select location
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button-link"
              onClick={() => setCreatingLocation((current) => !current)}
            >
              {creatingLocation ? 'Use existing location' : 'Add new location'}
            </button>
          </div>

          {creatingLocation && (
            <>
              <label>
                New Location Name
                <input value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} />
              </label>
              <label>
                Location Type
                <input value={newLocationType} onChange={(e) => setNewLocationType(e.target.value)} placeholder="warehouse, shelf, rack..." />
              </label>
            </>
          )}

          <label>
            Initial quantity at location
            <input
              type="number"
              value={initialQuantity}
              onChange={(e) => setInitialQuantity(Number(e.target.value))}
              min={0}
            />
          </label>

          <div>
            <button type="submit" className="button-link" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add item'}
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading...</p>}
      {currentError && <p className="auth-error">{currentError}</p>}

      {!loading && !pageError && (
        <ul className="inventory-list">
          {items.map((it) => (
            <li key={it.id} className="inventory-item">
              <div className="icon-square">
                <ItemIcon />
              </div>

              <div className="inventory-meta">
                <strong>{it.name}</strong>
                <div style={{ color: '#64748b', fontSize: '0.92rem' }}>{it.sku}</div>
              </div>

              <div className="actions">
                <Link to={`/items/${it.id}`} className="button-link">View</Link>
                <Link to={`/items/${it.id}`} className="button-link">Edit</Link>
                <button
                  type="button"
                  className="button-link danger"
                  onClick={async () => {
                    if (!confirm('Delete this item?')) return;
                    try {
                      await deleteItem(it.id);
                      setItems((prevItems) => prevItems.filter((item) => item.id !== it.id));
                    } catch (err) {
                      if (err instanceof Error) {
                        setPageError(err.message);
                      } else if (typeof err === 'string') {
                        setPageError(err);
                      } else {
                        setPageError(JSON.stringify(err));
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default InventoryList;
