// api.js — Frontend API client
// All calls go to http://localhost:8000 by default.
// Change API_BASE if you deploy the backend to a server.

const API_BASE = window.POS_API_BASE || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

const API = {
  // ── Auth ─────────────────────────────────────────────────
  login: (store_id, pin) =>
    apiFetch(`/api/auth/login?store_id=${encodeURIComponent(store_id)}&pin=${encodeURIComponent(pin)}`, { method: 'POST' }),

  // ── Stores ───────────────────────────────────────────────
  getStores: () => apiFetch('/api/stores'),
  createStore: (data) => apiFetch('/api/stores', { method: 'POST', body: JSON.stringify(data) }),
  updateStore: (id, data) => apiFetch(`/api/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Categories ───────────────────────────────────────────
  getCategories: () => apiFetch('/api/categories'),
  createCategory: (data) => apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),

  // ── Items ────────────────────────────────────────────────
  getItems: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch('/api/items' + (q ? '?' + q : ''));
  },
  createItem: (data) => apiFetch('/api/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => apiFetch(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleStock: (id) => apiFetch(`/api/items/${id}/toggle-stock`, { method: 'PATCH' }),
  deleteItem: (id) => apiFetch(`/api/items/${id}`, { method: 'DELETE' }),

  // ── Employees ────────────────────────────────────────────
  getEmployees: (store_id = null) =>
    apiFetch('/api/employees' + (store_id ? `?store_id=${store_id}` : '')),
  createEmployee: (data) => apiFetch('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) => apiFetch(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleEmployee: (id) => apiFetch(`/api/employees/${id}/toggle`, { method: 'PATCH' }),

  // ── Orders ───────────────────────────────────────────────
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch('/api/orders' + (q ? '?' + q : ''));
  },
  createOrder: (data) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrderSummary: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch('/api/orders/summary' + (q ? '?' + q : ''));
  },

  // ── Attendance ───────────────────────────────────────────
  getAttendance: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch('/api/attendance' + (q ? '?' + q : ''));
  },
  clockIn: (emp_id, store_id) =>
    apiFetch('/api/attendance/clock-in', { method: 'POST', body: JSON.stringify({ emp_id, store_id }) }),
  clockOut: (att_id) =>
    apiFetch(`/api/attendance/clock-out/${att_id}`, { method: 'PATCH' }),
  getActiveSession: (emp_id) =>
    apiFetch(`/api/attendance/active/${emp_id}`),

  // ── Settings ─────────────────────────────────────────────
  getSettings: () => apiFetch('/api/settings'),
  updateSettings: (data) => apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

Object.assign(window, { API });
