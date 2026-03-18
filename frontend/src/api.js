const BASE_URL = '/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      )
    ).toString();
    return fetchJSON(`${BASE_URL}/products${query ? `?${query}` : ''}`);
  },

  getProduct: (id) => fetchJSON(`${BASE_URL}/products/${id}`),

  getCategories: () => fetchJSON(`${BASE_URL}/categories`),
};