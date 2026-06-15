import { useEffect, useState } from 'react';
import BookingForm from '../components/BookingForm';
import { getRestaurants } from '../services/restaurantService';

export default function BookingPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then((data) => {
        setRestaurants(data.restaurants);
        if (data.restaurants.length > 0) {
          setSelectedRestaurant(data.restaurants[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-grid">
      <div>
        <p className="eyebrow">Customer Booking</p>
        <h1>Find your table</h1>
        
        {loading && <p className="muted">Loading restaurants...</p>}
        {error && <div className="alert">{error}</div>}
        
        {!loading && !error && (
          <>
            <p className="muted" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              Select a restaurant from the list below:
            </p>
            <div className="restaurant-list">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className={`restaurant-card ${selectedRestaurant?.id === r.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRestaurant(r)}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    backgroundColor: selectedRestaurant?.id === r.id ? 'var(--surface-strong)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedRestaurant?.id === r.id 
                      ? 'inset 0 0 0 2px var(--primary), 0 4px 12px rgba(24, 37, 40, 0.05)' 
                      : '0 4px 12px rgba(24, 37, 40, 0.02)',
                    marginBottom: '0.75rem'
                  }}
                >
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{r.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{r.location}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <BookingForm selectedRestaurant={selectedRestaurant} />
    </div>
  );
}

