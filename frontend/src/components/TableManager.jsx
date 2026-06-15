import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createTable, deleteTable, getTables, updateTable } from '../services/tableService';

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ table_number: '', capacity: 2, location: 'Indoor' });

  const load = async () => {
    const data = await getTables(true);
    setTables(data.tables);
  };

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  const add = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await createTable(form);
      setForm({ table_number: '', capacity: 2, location: 'Indoor' });
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const patch = async (id, payload) => {
    setMessage('');
    try {
      await updateTable(id, payload);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deactivate = async (id) => {
    setMessage('');
    try {
      await deleteTable(id);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Table Inventory</h2>
      </div>
      {message && <div className="alert">{message}</div>}
      <form className="toolbar" onSubmit={add}>
        <input placeholder="Table number" value={form.table_number} onChange={(event) => setForm({ ...form, table_number: event.target.value })} required />
        <input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required />
        <select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>
          <option>Indoor</option>
          <option>Outdoor</option>
          <option>Window</option>
          <option>Private</option>
          <option>Family</option>
        </select>
        <button className="button" type="submit">
          <Plus size={17} />
          Add
        </button>
      </form>

      <div className="table-grid">
        {tables.map((table) => (
          <article key={table.id} className={table.is_active ? 'table-admin-card' : 'table-admin-card inactive'}>
            <input value={table.table_number} onChange={(event) => setTables((items) => items.map((item) => item.id === table.id ? { ...item, table_number: event.target.value } : item))} />
            <input type="number" min="1" value={table.capacity} onChange={(event) => setTables((items) => items.map((item) => item.id === table.id ? { ...item, capacity: event.target.value } : item))} />
            <input value={table.location} onChange={(event) => setTables((items) => items.map((item) => item.id === table.id ? { ...item, location: event.target.value } : item))} />
            <label className="checkbox-row">
              <input type="checkbox" checked={table.is_active} onChange={(event) => patch(table.id, { is_active: event.target.checked })} />
              Active
            </label>
            <div className="card-actions">
              <button className="icon-button" type="button" onClick={() => patch(table.id, table)} aria-label="Save table">
                <Save size={17} />
              </button>
              <button className="icon-button danger" type="button" onClick={() => deactivate(table.id)} aria-label="Deactivate table">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
