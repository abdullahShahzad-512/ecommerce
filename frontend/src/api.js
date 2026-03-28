/**
 * api.js — Shopr frontend API service
 * All /api/* requests are proxied by Vite → FastAPI :8000
 */
const BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 204) return { ok: true };
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* Drop null / undefined / empty string from query params */
function qs(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== false)
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
}

export const api = {
  /* ── Products ──────────────────────────────────────────────────────── */
  getProducts: (params = {}) =>
    fetchJSON(`${BASE}/products${qs(params)}`),

  getProduct: (id) =>
    fetchJSON(`${BASE}/products/${id}`),

  /* ── Server-side search suggestions ────────────────────────────────── */
  // Used by both Layout navbar search AND ProductsPage sidebar search
  getSearchSuggestions: (q) =>
    fetchJSON(`${BASE}/products/search/suggestions?q=${encodeURIComponent(q)}`),

  // Alias — some pages called this name
  searchProducts: (q) =>
    api.getProducts({ search: q, limit: 5 }),

  /* ── Categories ─────────────────────────────────────────────────────── */
  getCategories: () =>
    fetchJSON(`${BASE}/categories`),

  /* ── Cart ────────────────────────────────────────────────────────────── */
  calculateCart: (items) =>
    fetch(`${BASE}/cart/calculate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ items }),
    }).then(r => r.json()),

  /* ── Auth ────────────────────────────────────────────────────────────── */
  signup: (email, username, full_name, password) =>
    fetchJSON(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, full_name, password }),
    }),

  login: (email, password) =>
    fetchJSON(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refresh_token) =>
    fetchJSON(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    }),

  me: (token) =>
    fetchJSON(`${BASE}/auth/me`, {
      headers: { ...authHeaders(token) },
    }),

  /* ── Admin ───────────────────────────────────────────────────────────── */
  adminCreateProduct: (payload, token) =>
    fetchJSON(`${BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    }),

  adminUpdateProduct: (productId, payload, token) =>
    fetchJSON(`${BASE}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    }),

  adminDeleteProduct: (productId, token) =>
    fetchJSON(`${BASE}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
    }),

  adminGetUsers: (token) =>
    fetchJSON(`${BASE}/admin/users`, {
      headers: { ...authHeaders(token) },
    }),

  adminUpdateUserRole: (userId, role, token) =>
    fetchJSON(`${BASE}/admin/users/${userId}/role?role=${encodeURIComponent(role)}`, {
      method: 'PATCH',
      headers: { ...authHeaders(token) },
    }),

  adminDeleteUser: (userId, token) =>
    fetchJSON(`${BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
    }),

  adminCreateCategory: (payload, token) =>
    fetchJSON(`${BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    }),
};