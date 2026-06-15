import api from './api';

export const getTables = (includeInactive = false) =>
  api.get('/tables', { params: { include_inactive: includeInactive } }).then((res) => res.data);

export const getAvailableTables = (params) =>
  api.get('/tables/available', { params }).then((res) => res.data);

export const createTable = (payload) => api.post('/tables', payload).then((res) => res.data);
export const updateTable = (id, payload) => api.put(`/tables/${id}`, payload).then((res) => res.data);
export const deleteTable = (id) => api.delete(`/tables/${id}`).then((res) => res.data);
