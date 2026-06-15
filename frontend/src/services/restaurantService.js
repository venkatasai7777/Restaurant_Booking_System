import api from './api';

export const getRestaurants = () =>
  api.get('/restaurants').then((res) => res.data);
