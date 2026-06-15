import { createContext, useContext, useEffect, useReducer } from 'react';

import { getMe, login as loginRequest, register as registerRequest } from '../services/authService';

const AuthContext = createContext(null);

let parsedUser = null;
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser && storedUser !== 'undefined') {
    parsedUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error('Failed to parse user from localStorage:', e);
}

const initialState = {
  token: localStorage.getItem('token'),
  user: parsedUser,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, token: action.payload.token, user: action.payload.user, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'LOGOUT':
      return { token: null, user: null, loading: false };
    case 'READY':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.token) {
      dispatch({ type: 'READY' });
      return;
    }

    getMe()
      .then(({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });
      })
      .catch(() => logout());
  }, []);

  const persistSession = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
    return user;
  };

  const login = async (payload) => persistSession(await loginRequest(payload));
  const register = async (payload) => persistSession(await registerRequest(payload));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isAuthenticated: Boolean(state.token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
