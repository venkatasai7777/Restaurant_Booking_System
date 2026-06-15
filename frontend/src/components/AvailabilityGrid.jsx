export default function AvailabilityGrid({ tables, selectedTableId, onSelect }) {
  if (!tables.length) {
    return <div className="empty-state">No tables are available for this slot.</div>;
  }

  return (
    <div className="availability-grid">
      {tables.map((table) => (
        <button
          key={table.id}
          type="button"
          className={selectedTableId === table.id ? 'table-tile selected' : 'table-tile'}
          onClick={() => onSelect(table)}
        >
          <strong>{table.table_number}</strong>
          <span>{table.capacity} seats</span>
          <small>{table.location}</small>
        </button>
      ))}
    </div>
  );
}
