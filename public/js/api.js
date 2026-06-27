// public/js/api.js
const API_BASE = '/api';

function getToken() { return localStorage.getItem('siakad_token'); }
function getUser() {
  const u = localStorage.getItem('siakad_user');
  return u ? JSON.parse(u) : null;
}
function setSession(token, user) {
  localStorage.setItem('siakad_token', token);
  localStorage.setItem('siakad_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('siakad_token');
  localStorage.removeItem('siakad_user');
}

async function apiRequest(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }
  return data;
}

const api = {
  login: (username, password) => apiRequest('POST', '/auth/login', { username, password }),

  getMahasiswa: () => apiRequest('GET', '/mahasiswa'),
  createMahasiswa: (data) => apiRequest('POST', '/mahasiswa', data),
  updateMahasiswa: (id, data) => apiRequest('PUT', `/mahasiswa/${id}`, data),
  deleteMahasiswa: (id) => apiRequest('DELETE', `/mahasiswa/${id}`),

  getMatakuliah: () => apiRequest('GET', '/matakuliah'),
  createMatakuliah: (data) => apiRequest('POST', '/matakuliah', data),
  updateMatakuliah: (id, data) => apiRequest('PUT', `/matakuliah/${id}`, data),
  deleteMatakuliah: (id) => apiRequest('DELETE', `/matakuliah/${id}`),

  getNilai: () => apiRequest('GET', '/nilai'),
  createNilai: (data) => apiRequest('POST', '/nilai', data),
  updateNilai: (id, data) => apiRequest('PUT', `/nilai/${id}`, data),
  deleteNilai: (id) => apiRequest('DELETE', `/nilai/${id}`),

  getStats: () => apiRequest('GET', '/dashboard/stats'),

  backupNow: () => apiRequest('POST', '/backup/manual'),
  backupList: () => apiRequest('GET', '/backup/list')
};
