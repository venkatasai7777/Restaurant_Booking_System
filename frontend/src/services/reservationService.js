import api from './api';

export const createReservation = (payload) =>
  api.post('/reservations', payload).then((res) => res.data);

export const getMyReservations = () =>
  api.get('/reservations/my').then((res) => res.data);

export const updateReservation = (id, payload) =>
  api.put(`/reservations/${id}`, payload).then((res) => res.data);

export const cancelReservation = (id) =>
  api.delete(`/reservations/${id}/cancel`).then((res) => res.data);
