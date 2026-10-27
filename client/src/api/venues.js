import { apiRequest } from './client.js';

export async function getVenues(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });

  const endpoint = query.toString() ? `/venues?${query.toString()}` : '/venues';
  return apiRequest(endpoint, { method: 'GET' });
}

export async function getVenueById(id) {
  return apiRequest(`/venues/${id}`, { method: 'GET' });
}

export async function getVenueAvailability(id, date) {
  const endpoint = date ? `/venues/${id}/availability?date=${date}` : `/venues/${id}/availability`;
  return apiRequest(endpoint, { method: 'GET' });
}

export async function createVenue(venueData) {
  return apiRequest('/venues', {
    method: 'POST',
    body: venueData,
  });
}

export async function updateVenue(id, venueData) {
  return apiRequest(`/venues/${id}`, {
    method: 'PUT',
    body: venueData,
  });
}

export async function deleteVenue(id) {
  return apiRequest(`/venues/${id}`, {
    method: 'DELETE',
  });
}
