import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await register(form);
      navigate('/book', { replace: true });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="auth-page">
      <form className="panel auth-card" onSubmit={submit}>
        <h1>Create Account</h1>
        {message && <div className="alert">{message}</div>}
        <label>
          Full name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        <button className="button" type="submit">Register</button>
        <Link to="/login">Already have an account?</Link>
      </form>
    </section>
  );
}
