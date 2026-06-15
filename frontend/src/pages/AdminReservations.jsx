import { useEffect, useState } from 'react';

import ReservationTable from '../components/ReservationTable';
import { confirmReservation, getAdminReservations, getBookingHistory, rejectReservation } from '../services/adminService';
import { cancelReservation } from '../services/reservationService';
import { getTables } from '../services/tableService';

export default function AdminReservations() {
  const [filters, setFilters] = useState({ date: '', status: '', table_id: '' });
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [history, setHistory] = useState({ page: 1, pages: 1, total: 0 });
  const [message, setMessage] = useState('');

  const load = async (page = history.page) => {
    setMessage('');
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [current, historyData] = await Promise.all([
        getAdminReservations(cleanFilters),
        getBookingHistory({ ...cleanFilters, page, per_page: 10 }),
      ]);
      setReservations(current.reservations);
      setHistory(historyData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    getTables(true).then((data) => setTables(data.tables));
  }, []);

  useEffect(() => {
    load(1);
  }, [filters]);

  const action = async (fn, id) => {
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
        <h1>Reservations</h1>
      </div>
      <div className="toolbar">
        <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filters.table_id} onChange={(event) => setFilters({ ...filters, table_id: event.target.value })}>
          <option value="">All tables</option>
          {tables.map((table) => <option key={table.id} value={table.id}>{table.table_number}</option>)}
        </select>
      </div>
      {message && <div className="alert">{message}</div>}
      <ReservationTable
        reservations={reservations}
        onConfirm={(id) => action(confirmReservation, id)}
        onReject={(id) => action(rejectReservation, id)}
        onCancel={(id) => action(cancelReservation, id)}
      />
      <section className="panel">
        <div className="section-header">
          <h2>Booking History</h2>
          <p>{history.total || 0} records</p>
        </div>
        <ReservationTable
          reservations={history.reservations || []}
          onConfirm={(id) => action(confirmReservation, id)}
          onReject={(id) => action(rejectReservation, id)}
          onCancel={(id) => action(cancelReservation, id)}
        />
        <div className="pager">
          <button className="button button-small button-ghost" disabled={history.page <= 1} onClick={() => load(history.page - 1)}>Previous</button>
          <span>Page {history.page || 1} of {history.pages || 1}</span>
          <button className="button button-small button-ghost" disabled={history.page >= history.pages} onClick={() => load(history.page + 1)}>Next</button>
        </div>
      </section>
    </section>
  );
}
