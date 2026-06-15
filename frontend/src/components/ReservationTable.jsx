import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import BookingActionButtons from './BookingActionButtons';
import StatusBadge from './StatusBadge';

export default function ReservationTable({ reservations, onConfirm, onReject, onCancel }) {
  const [sortKey, setSortKey] = useState('reservation_time');
  const [direction, setDirection] = useState('asc');

  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const first = `${a[sortKey] || ''}`;
      const second = `${b[sortKey] || ''}`;
      return direction === 'asc' ? first.localeCompare(second) : second.localeCompare(first);
    });
  }, [reservations, sortKey, direction]);

  const changeSort = (key) => {
    if (key === sortKey) setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {[
              ['reservation_date', 'Date'],
              ['reservation_time', 'Time'],
              ['guest_count', 'Guests'],
              ['status', 'Status'],
            ].map(([key, label]) => (
              <th key={key}>
                <button type="button" onClick={() => changeSort(key)}>
                  {label}
                  <ArrowUpDown size={14} />
                </button>
              </th>
            ))}
            <th>Customer</th>
            <th>Table</th>
            <th>Requests</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.reservation_date}</td>
              <td>{reservation.reservation_time}</td>
              <td>{reservation.guest_count}</td>
              <td><StatusBadge status={reservation.status} /></td>
              <td>{reservation.user?.name || reservation.user_id}</td>
              <td>{reservation.table?.table_number || reservation.table_id}</td>
              <td>{reservation.special_requests || '-'}</td>
              <td>
                <BookingActionButtons
                  reservation={reservation}
                  onConfirm={onConfirm}
                  onReject={onReject}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!sorted.length && <div className="empty-state">No reservations match the filters.</div>}
    </div>
  );
}
