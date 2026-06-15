import { CalendarClock, Pencil, XCircle } from 'lucide-react';
import { useState } from 'react';

import { cancelReservation, updateReservation } from '../services/reservationService';
import StatusBadge from './StatusBadge';

export default function ReservationCard({ reservation, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    reservation_date: reservation.reservation_date,
    reservation_time: reservation.reservation_time,
    guest_count: reservation.guest_count,
    duration_minutes: reservation.duration_minutes,
    special_requests: reservation.special_requests || '',
    table_id: reservation.table_id,
  });

  const upcoming = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`) > new Date();
  const canManage = upcoming && ['pending', 'confirmed'].includes(reservation.status);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await updateReservation(reservation.id, form);
      setEditing(false);
      onChanged();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancel = async () => {
    setMessage('');
    try {
      await cancelReservation(reservation.id);
      onChanged();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <article className="reservation-card">
      <div className="reservation-card-head">
        <div>
          <h3>{reservation.table?.table_number || `Table ${reservation.table_id}`}</h3>
          <p><CalendarClock size={16} /> {reservation.reservation_date} at {reservation.reservation_time}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>
      <p>{reservation.guest_count} guests · {reservation.duration_minutes} minutes</p>
      {reservation.special_requests && <p className="muted">{reservation.special_requests}</p>}
      {message && <div className="alert">{message}</div>}

      {editing && (
        <form className="inline-edit" onSubmit={save}>
          <input type="date" name="reservation_date" value={form.reservation_date} onChange={update} />
          <input type="time" name="reservation_time" value={form.reservation_time} onChange={update} />
          <input type="number" name="guest_count" min="1" value={form.guest_count} onChange={update} />
          <textarea name="special_requests" value={form.special_requests} onChange={update} rows="2" />
          <button className="button button-small" type="submit">Save</button>
        </form>
      )}

      {canManage && (
        <div className="card-actions">
          <button className="button button-small button-ghost" type="button" onClick={() => setEditing((value) => !value)}>
            <Pencil size={15} />
            Modify
          </button>
          <button className="button button-small danger" type="button" onClick={cancel}>
            <XCircle size={15} />
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}
