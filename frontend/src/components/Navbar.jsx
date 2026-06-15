import { CalendarCheck, LayoutDashboard, LogOut, Menu, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user?.role === 'admin'
    ? [
        ['/admin/dashboard', 'Dashboard'],
        ['/admin/reservations', 'Reservations'],
        ['/admin/tables', 'Tables'],
      ]
    : [
        ['/book', 'Book'],
        ['/my-reservations', 'My Reservations'],
      ];

  return (
    <header className="topbar">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <Utensils size={22} />
        <span>TableReserve</span>
      </Link>
      <button className="icon-button mobile-only" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <nav className={open ? 'nav-links is-open' : 'nav-links'}>
        {isAuthenticated && links.map(([href, label]) => (
          <NavLink key={href} to={href} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
        {!isAuthenticated ? (
          <>
            <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
            <Link className="button button-small" to="/register" onClick={() => setOpen(false)}>
              <CalendarCheck size={16} />
              Register
            </Link>
          </>
        ) : (
          <>
            {user?.role === 'admin' && <LayoutDashboard size={18} className="nav-icon" />}
            <span className="nav-user">{user?.name}</span>
            <button className="button button-small button-ghost" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
