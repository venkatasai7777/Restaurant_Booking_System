import api from './api';

export const getAdminReservations = (params = {}) =>
  api.get('/admin/reservations', { params }).then((res) => res.data);

export const getBookingHistory = (params = {}) =>
  api.get('/admin/reservations/history', { params }).then((res) => res.data);

export const confirmReservation = (id) =>
  api.put(`/admin/reservations/${id}/confirm`).then((res) => res.data);

export const rejectReservation = (id) =>
  api.put(`/admin/reservations/${id}/reject`).then((res) => res.data);

export const getFloorView = (date) =>
  api.get('/admin/floor', { params: { date } }).then((res) => res.data);
