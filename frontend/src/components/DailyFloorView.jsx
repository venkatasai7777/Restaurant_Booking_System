import { useEffect, useMemo, useState } from 'react';

import { getFloorView } from '../services/adminService';
import StatusBadge from './StatusBadge';

const today = new Date().toISOString().slice(0, 10);
const slots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

export default function DailyFloorView({ date = today }) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [data, setData] = useState({ tables: [], reservations: [] });

  useEffect(() => {
    getFloorView(selectedDate).then(setData).catch(() => setData({ tables: [], reservations: [] }));
  }, [selectedDate]);

  const lookup = useMemo(() => {
    const map = {};
    data.reservations.forEach((reservation) => {
      map[`${reservation.table_id}-${reservation.reservation_time}`] = reservation;
    });
    return map;
  }, [data.reservations]);

  return (
    <section className="panel floor-panel">
      <div className="section-header">
        <h2>Floor View</h2>
        <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
      </div>
      <div className="floor-scroll">
        <div className="floor-grid" style={{ gridTemplateColumns: `96px repeat(${slots.length}, minmax(88px, 1fr))` }}>
          <strong>Table</strong>
          {slots.map((slot) => <strong key={slot}>{slot}</strong>)}
          {data.tables.map((table) => (
            <FragmentRow key={table.id} table={table} lookup={lookup} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FragmentRow({ table, lookup }) {
  return (
    <>
      <div className="floor-table-label">{table.table_number}</div>
      {slots.map((slot) => {
        const reservation = lookup[`${table.id}-${slot}`];
        return (
          <div key={slot} className={reservation ? 'floor-cell occupied' : 'floor-cell'}>
            {reservation ? <StatusBadge status={reservation.status} /> : 'Open'}
          </div>
        );
      })}
    </>
  );
}
