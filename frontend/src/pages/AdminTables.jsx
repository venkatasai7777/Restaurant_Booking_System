import TableManager from '../components/TableManager';

export default function AdminTables() {
  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Admin</p>
        <h1>Tables</h1>
      </div>
      <TableManager />
    </section>
  );
}
