import { useEffect, useState } from 'react';

import ReservationCard from '../components/ReservationCard';
import { getMyReservations } from '../services/reservationService';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const data = await getMyReservations();
      setReservations(data.reservations);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>My Reservations</h1>
        </div>
      </div>
      {message && <div className="alert">{message}</div>}
      <div className="card-list">
        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} onChanged={load} />
        ))}
      </div>
      {!reservations.length && <div className="empty-state">No reservations yet.</div>}
    </section>
  );
}
