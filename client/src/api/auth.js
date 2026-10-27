import { apiRequest } from './client.js';

export async function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

export async function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  return apiRequest('/auth/me', {
    method: 'GET',
  });
}
