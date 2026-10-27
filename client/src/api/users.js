import { apiRequest } from './client.js';

export async function updateProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: profileData,
  });
}

export async function getAdminStats() {
  return apiRequest('/users/admin/stats', {
    method: 'GET',
  });
}
