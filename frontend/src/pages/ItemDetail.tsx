import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem, deleteItem, adjustStock, listLocations } from '../services/api';
import type { Item, Location } from '../types';

function ItemDetail() {
  const { id } = useParams();
  const itemId = Number(id || 0);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getItem(itemId), listLocations()])
      .then(([it, locs]) => {
        if (!mounted) return;
        setItem(it);
        setName(it.name);
        setDescription(it.description || '');
        setUnit(it.unit || '');
        setLocations(locs);
        if (locs.length > 0) setSelectedLocation(locs[0].id);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [itemId]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const updated = await updateItem(itemId, { name, description, unit });
      setItem(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteItem(itemId);
      navigate('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleAdjust = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedLocation) {
      setError('Select a location');
      return;
    }

    try {
      await adjustStock(itemId, selectedLocation, Number(adjustQty), 'manual adjustment');
      // refresh item/stock may require separate endpoint; simple UX: notify and keep
      alert('Stock adjusted');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="auth-error">{error}</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <section className="card">
      <h2>Item: {item.name}</h2>
      <p>SKU: {item.sku}</p>

      {!editing && (
        <>
          <p>{item.description}</p>
          <p>Unit: {item.unit}</p>
          <div className="hero-actions">
            <button className="button-link" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="button-link danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}

      {editing && (
        <form className="auth-form" onSubmit={handleSave}>
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

          <div>
            <button type="submit" className="button-link" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="button-link" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <hr />

      <section>
        <h3>Adjust Stock</h3>
        <form className="auth-form" onSubmit={handleAdjust}>
          <label>
            Location
            <select value={selectedLocation ?? ''} onChange={(e) => setSelectedLocation(Number(e.target.value))}>
              {locations.map((l) => (
                <option value={l.id} key={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity delta (positive to add, negative to remove)
            <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} />
          </label>

          <div>
            <button type="submit" className="button-link">Adjust</button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default ItemDetail;
