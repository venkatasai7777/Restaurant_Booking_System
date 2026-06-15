import { Check, Clipboard, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { createReservation } from '../services/reservationService';
import { getAvailableTables } from '../services/tableService';
import AvailabilityGrid from './AvailabilityGrid';

const today = new Date().toISOString().slice(0, 10);

export default function BookingForm({ selectedRestaurant }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    reservation_date: today,
    reservation_time: '18:00',
    duration_minutes: 90,
    guest_count: 2,
    special_requests: '',
  });
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setTables([]);
    setSelectedTable(null);
    setStep(1);
  }, [selectedRestaurant]);

  const summary = useMemo(() => {
    if (!selectedTable) return '';
    return `Reservation #${confirmation?.id || 'new'} | ${selectedRestaurant?.name || 'Restaurant'} | ${form.reservation_date} ${form.reservation_time} | ${form.guest_count} guests | ${selectedTable.table_number}`;
  }, [confirmation, form, selectedTable, selectedRestaurant]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const findTables = async (event) => {
    event?.preventDefault();
    if (!selectedRestaurant) {
      setMessage('Please select a restaurant first.');
      return;
    }
    setMessage('');
    setLoading(true);
    setSelectedTable(null);
    try {
      const data = await getAvailableTables({
        ...form,
        restaurant_id: selectedRestaurant.id
      });
      setTables(data.tables);
      setStep(3);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const submitReservation = async () => {
    if (!selectedTable) {
      setMessage('Please choose a table.');
      return;
    }
    if (Number(form.guest_count) > selectedTable.capacity) {
      setMessage('Guest count exceeds the selected table capacity.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = await createReservation({ ...form, table_id: selectedTable.id });
      setConfirmation(data.reservation);
      setStep(5);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <section className="panel success-panel">
        <Check size={40} />
        <h2>Booking request received</h2>
        <p>Your reservation is pending staff confirmation.</p>
        <label>
          Booking reference
          <div className="copy-row">
            <input readOnly value={summary} />
            <button className="icon-button" type="button" onClick={() => navigator.clipboard?.writeText(summary)} aria-label="Copy confirmation">
              <Clipboard size={18} />
            </button>
          </div>
        </label>
      </section>
    );
  }

  return (
    <section className="panel booking-panel">
      <div className="stepper">
        {[1, 2, 3, 4, 5].map((item) => (
          <span key={item} className={item <= step ? 'step active' : 'step'}>{item}</span>
        ))}
      </div>

      {message && <div className="alert">{message}</div>}

      {step <= 2 && (
        <>
          <div style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
              {selectedRestaurant ? `Book at ${selectedRestaurant.name}` : 'Book a Table'}
            </h2>
            {selectedRestaurant && (
              <p className="muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
                {selectedRestaurant.location}
              </p>
            )}
          </div>
          <form className="form-grid" onSubmit={findTables} style={{ marginTop: '0.5rem' }}>

          <label>
            Date
            <input type="date" name="reservation_date" min={today} value={form.reservation_date} onChange={update} required />
          </label>
          <label>
            Time
            <input type="time" name="reservation_time" value={form.reservation_time} onChange={update} required />
          </label>
          <label>
            Guests
            <input type="number" name="guest_count" min="1" max="20" value={form.guest_count} onChange={update} required />
          </label>
          <label>
            Duration
            <select name="duration_minutes" value={form.duration_minutes} onChange={update}>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </label>
          <button className="button form-action" type="submit" disabled={loading}>
            <Search size={18} />
            {loading ? 'Checking...' : 'Find Tables'}
          </button>
        </form>
        </>
      )}

      {step >= 3 && (
        <>
          <div className="section-header">
            <div>
              <h2>Choose a table</h2>
              <p>{selectedRestaurant?.name} | {form.reservation_date} at {form.reservation_time} for {form.guest_count} guests</p>
            </div>

            <button className="button button-ghost" type="button" onClick={() => setStep(1)}>Change search</button>
          </div>
          <AvailabilityGrid tables={tables} selectedTableId={selectedTable?.id} onSelect={(table) => { setSelectedTable(table); setStep(4); }} />
        </>
      )}

      {step >= 4 && selectedTable && (
        <div className="review-box">
          <label>
            Special requests
            <textarea name="special_requests" value={form.special_requests} onChange={update} rows="4" placeholder="Allergies, occasion, seating preference" />
          </label>
          <div className="summary-line">
            <strong>{selectedTable.table_number}</strong>
            <span>{selectedTable.capacity} seats, {selectedTable.location}</span>
          </div>
          <button className="button" type="button" onClick={submitReservation} disabled={loading}>
            <Check size={18} />
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </section>
  );
}
