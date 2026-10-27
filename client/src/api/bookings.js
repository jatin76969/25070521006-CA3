import { apiRequest } from './client.js';

export async function createBooking(bookingData) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: bookingData,
  });
}

export async function getMyBookings() {
  return apiRequest('/bookings/my-bookings', { method: 'GET' });
}

export async function getBookingById(id) {
  return apiRequest(`/bookings/${id}`, { method: 'GET' });
}

export async function cancelBooking(id, reason = '') {
  return apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: { reason },
  });
}

export async function getAllBookings(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const endpoint = query.toString() ? `/bookings/admin/all?${query.toString()}` : '/bookings/admin/all';
  return apiRequest(endpoint, { method: 'GET' });
}
