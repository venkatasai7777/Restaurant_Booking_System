import { useEffect, useMemo, useState } from 'react';

import DailyFloorView from '../components/DailyFloorView';
import ReservationTable from '../components/ReservationTable';
import { confirmReservation, getAdminReservations, rejectReservation } from '../services/adminService';
import { cancelReservation } from '../services/reservationService';

const today = new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const data = await getAdminReservations({ date: today });
      setReservations(data.reservations);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const counts = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter((item) => item.status === 'pending').length,
    confirmed: reservations.filter((item) => item.status === 'confirmed').length,
  }), [reservations]);

  const action = async (fn, id) => {
    setMessage('');
    try {
      await fn(id);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Admin</p>
        <h1>Today&apos;s Bookings</h1>
      </div>
      <div className="stats-grid">
        <div className="stat"><span>Total</span><strong>{counts.total}</strong></div>
        <div className="stat"><span>Pending</span><strong>{counts.pending}</strong></div>
        <div className="stat"><span>Confirmed</span><strong>{counts.confirmed}</strong></div>
      </div>
      {message && <div className="alert">{message}</div>}
      <ReservationTable
        reservations={reservations}
        onConfirm={(id) => action(confirmReservation, id)}
        onReject={(id) => action(rejectReservation, id)}
        onCancel={(id) => action(cancelReservation, id)}
      />
      <DailyFloorView date={today} />
    </section>
  );
}
