import express from "express";
import cors from "cors";
import { products } from "./data/products.js";
import {
  clearCart,
  createSession,
  createOrder,
  createUser,
  findUserByEmail,
  getCartView,
  getStore,
  getUserByToken,
  removeCartItem,
  removeSession,
  saveStore,
  setCartQty,
  upsertCartItem,
  verifyPassword,
  maybeUpgradePassword,
} from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

const isRequired = (value) => typeof value === "string" && value.trim().length > 0;
const sanitizeUser = (user) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });

const getToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
};

const requireAuth = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  const store = await getStore();
  const user = getUserByToken(store, token);
  if (!user) {
    return res.status(401).json({ message: "Invalid session. Please log in again." });
  }
  req.auth = { token, user, store };
  return next();
};

app.post("/api/auth/register", async (req, res) => {
  const body = req.body ?? {};
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const store = await getStore();
  if (findUserByEmail(store, email)) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const user = createUser(store, { name, email, password });
  const session = createSession(store, user.id);
  await saveStore(store);
  return res.status(201).json({ user: sanitizeUser(user), token: session.token });
});

app.post("/api/auth/login", async (req, res) => {
  const body = req.body ?? {};
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const store = await getStore();
  const user = findUserByEmail(store, email);
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  maybeUpgradePassword(user, password);
  const session = createSession(store, user.id);
  await saveStore(store);
  return res.json({ user: sanitizeUser(user), token: session.token });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  return res.json({ user: sanitizeUser(req.auth.user) });
});

app.post("/api/auth/logout", requireAuth, async (req, res) => {
  removeSession(req.auth.store, req.auth.token);
  await saveStore(req.auth.store);
  return res.json({ ok: true });
});

app.get("/api/products", (req, res) => {
  const { query = "", category = "all", sortBy = "popular" } = req.query;
  const normalizedQuery = String(query).toLowerCase().trim();

  let filtered = products.filter((item) => {
    const byQuery =
      normalizedQuery.length === 0 ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery);
    const byCategory = category === "all" || item.category === category;
    return byQuery && byCategory;
  });

  if (sortBy === "price-low") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else {
    filtered = [...filtered].sort((a, b) => b.sold - a.sold);
  }

  res.json({ items: filtered });
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((item) => item.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  return res.json({ item: product });
});

app.get("/api/cart", requireAuth, async (req, res) => {
  return res.json(getCartView(req.auth.store, products, req.auth.user.id));
});

app.post("/api/cart/items", requireAuth, async (req, res) => {
  const productId = Number(req.body?.productId);
  const qty = Number(req.body?.qty ?? 1);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }
  const cartView = getCartView(req.auth.store, products, req.auth.user.id);
  const existing = cartView.items.find((item) => item.id === productId);
  const nextQty = (existing?.qty ?? 0) + qty;
  if (nextQty > product.stock) {
    return res.status(400).json({ message: `Only ${product.stock} item(s) available in stock.` });
  }

  upsertCartItem(req.auth.store, req.auth.user.id, productId, qty);
  await saveStore(req.auth.store);
  return res.status(201).json(getCartView(req.auth.store, products, req.auth.user.id));
});

app.patch("/api/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  const qty = Number(req.body?.qty);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  if (qty > product.stock) {
    return res.status(400).json({ message: `Only ${product.stock} item(s) available in stock.` });
  }

  const updated = setCartQty(req.auth.store, req.auth.user.id, productId, qty);
  if (!updated) {
    return res.status(404).json({ message: "Item not in cart." });
  }

  await saveStore(req.auth.store);
  return res.json(getCartView(req.auth.store, products, req.auth.user.id));
});

app.delete("/api/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  const removed = removeCartItem(req.auth.store, req.auth.user.id, productId);
  if (!removed) {
    return res.status(404).json({ message: "Item not in cart." });
  }

  await saveStore(req.auth.store);
  return res.json(getCartView(req.auth.store, products, req.auth.user.id));
});

app.delete("/api/cart", requireAuth, async (req, res) => {
  clearCart(req.auth.store, req.auth.user.id);
  await saveStore(req.auth.store);
  return res.json(getCartView(req.auth.store, products, req.auth.user.id));
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const body = req.body ?? {};
  const customer = body.customer ?? {};
  const paymentMethod = String(body.paymentMethod ?? "card");

  const requiredFields = ["name", "email", "phone", "address", "city", "postal"];
  const missing = requiredFields.filter((field) => !isRequired(customer[field]));
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  const cartView = getCartView(req.auth.store, products, req.auth.user.id);
  if (cartView.items.length === 0) {
    return res.status(400).json({ message: "Cannot place order with an empty cart." });
  }
  const outOfStock = cartView.items.find((item) => item.qty > item.stock);
  if (outOfStock) {
    return res.status(400).json({
      message: `${outOfStock.name} has only ${outOfStock.stock} item(s) left. Please update your cart.`,
    });
  }

  const order = createOrder({
    userId: req.auth.user.id,
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      postal: customer.postal.trim(),
    },
    paymentMethod,
    cartView,
  });

  req.auth.store.orders.unshift(order);
  clearCart(req.auth.store, req.auth.user.id);
  await saveStore(req.auth.store);
  return res.status(201).json({ order });
});

app.get("/api/orders", requireAuth, async (req, res) => {
  const orders = req.auth.store.orders.filter((item) => item.userId === req.auth.user.id);
  return res.json({ items: orders });
});

app.get("/api/orders/:id", requireAuth, async (req, res) => {
  const order = req.auth.store.orders.find((item) => item.id === req.params.id && item.userId === req.auth.user.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  return res.json({ order });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

export default app;
