import { CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const destination = user?.role === 'admin' ? '/admin/dashboard' : '/book';

  return (
    <section className="hero">
      <div className="hero-content">
    
        <h1>Restaurant Table Reservation System</h1>
        <p>Reserve the right table, manage every booking, and keep service moving from one connected dashboard.</p>
        <div className="hero-actions">
          <Link className="button" to={destination}>
            <CalendarDays size={18} />
            {user?.role === 'admin' ? 'Open Dashboard' : 'Book a Table'}
          </Link>
          {!user && <Link className="button button-ghost" to="/login">Login</Link>}
        </div>
      </div>
      <div className="feature-strip">
        <span><Sparkles size={17} /> Live availability</span>
        <span><ShieldCheck size={17} /> JWT role access</span>
        <span><CalendarDays size={17} /> Booking history</span>
      </div>
    </section>
  );
}
