const API_BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "mini_project_token";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

const request = async (path, options = {}) => {
  let res;
  try {
    const token = authStorage.getToken();
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach API server. Start backend with: npm run server");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const api = {
  register: ({ name, email, password }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request("/auth/me"),
  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params);
    const suffix = query.toString() ? `?${query}` : "";
    return request(`/products${suffix}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getCart: () => request("/cart"),
  addCartItem: ({ productId, qty = 1 }) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, qty }),
    }),
  updateCartItem: ({ productId, qty }) =>
    request(`/cart/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ qty }),
    }),
  removeCartItem: (productId) =>
    request(`/cart/items/${productId}`, {
      method: "DELETE",
    }),
  clearCart: () =>
    request("/cart", {
      method: "DELETE",
    }),
  createOrder: ({ customer, paymentMethod }) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ customer, paymentMethod }),
    }),
  getOrders: () => request("/orders"),
  getOrder: (id) => request(`/orders/${id}`),
};
