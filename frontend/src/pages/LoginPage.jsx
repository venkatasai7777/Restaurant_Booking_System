import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const user = await login(form);
      const fallback = user.role === 'admin' ? '/admin/dashboard' : '/book';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="auth-page">
      <form className="panel auth-card" onSubmit={submit}>
        <h1>Login</h1>
        {message && <div className="alert">{message}</div>}
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        <button className="button" type="submit">Login</button>
        <Link to="/register">Create customer account</Link>
      </form>
    </section>
  );
}
