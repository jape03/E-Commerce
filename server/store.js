/* global Buffer */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "data", "store.json");

const defaultStore = {
  users: [],
  sessions: [],
  carts: {},
  orders: [],
};

const normalizeStore = (store) => ({
  users: Array.isArray(store?.users) ? store.users : [],
  sessions: Array.isArray(store?.sessions) ? store.sessions : [],
  carts: store?.carts && typeof store.carts === "object" ? store.carts : {},
  orders: Array.isArray(store?.orders) ? store.orders : [],
});

export const getStore = async () => {
  if (!existsSync(STORE_PATH)) {
    await saveStore(defaultStore);
    return { ...defaultStore };
  }

  const content = await readFile(STORE_PATH, "utf8");
  try {
    return normalizeStore(JSON.parse(content));
  } catch {
    await saveStore(defaultStore);
    return { ...defaultStore };
  }
};

export const saveStore = async (store) => {
  const normalized = normalizeStore(store);
  await writeFile(STORE_PATH, JSON.stringify(normalized, null, 2), "utf8");
};

const computeSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 299 ? 0 : 50;
  const discount = subtotal > 500 ? 100 : 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total };
};

const getUserCart = (store, userId) => {
  if (!Array.isArray(store.carts[userId])) {
    store.carts[userId] = [];
  }
  return store.carts[userId];
};

export const getCartView = (store, products, userId) => {
  const items = getUserCart(store, userId)
    .map((row) => {
      const product = products.find((item) => item.id === row.productId);
      if (!product) {
        return null;
      }

      return {
        ...product,
        qty: row.qty,
        lineTotal: product.price * row.qty,
      };
    })
    .filter(Boolean);

  return {
    items,
    summary: computeSummary(items),
  };
};

export const upsertCartItem = (store, userId, productId, qty) => {
  const cart = getUserCart(store, userId);
  const found = cart.find((item) => item.productId === productId);
  if (found) {
    found.qty += qty;
    return;
  }
  cart.push({ productId, qty });
};

export const setCartQty = (store, userId, productId, qty) => {
  const cart = getUserCart(store, userId);
  const found = cart.find((item) => item.productId === productId);
  if (!found) {
    return false;
  }
  found.qty = qty;
  return true;
};

export const removeCartItem = (store, userId, productId) => {
  const cart = getUserCart(store, userId);
  const sizeBefore = cart.length;
  store.carts[userId] = cart.filter((item) => item.productId !== productId);
  return store.carts[userId].length !== sizeBefore;
};

export const clearCart = (store, userId) => {
  store.carts[userId] = [];
};

export const createOrder = ({ userId, customer, paymentMethod, cartView }) => ({
  id: `ORD-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
  userId,
  customer,
  paymentMethod,
  items: cartView.items,
  summary: cartView.summary,
  status: "processing",
  createdAt: new Date().toISOString(),
});

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

export const verifyPassword = (password, storedPassword) => {
  const candidate = String(password ?? "");
  const current = String(storedPassword ?? "");
  if (!current.startsWith("scrypt$")) {
    return candidate === current;
  }

  const parts = current.split("$");
  if (parts.length !== 3) {
    return false;
  }

  const [, salt, hash] = parts;
  const derived = crypto.scryptSync(candidate, salt, 64).toString("hex");
  const currentBuffer = Buffer.from(hash, "hex");
  const nextBuffer = Buffer.from(derived, "hex");
  if (currentBuffer.length !== nextBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(currentBuffer, nextBuffer);
};

export const maybeUpgradePassword = (user, plainPassword) => {
  if (!user || String(user.password).startsWith("scrypt$")) {
    return false;
  }
  user.password = hashPassword(String(plainPassword ?? ""));
  return true;
};

export const createUser = (store, { name, email, password }) => {
  const user = {
    id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  return user;
};

export const findUserByEmail = (store, email) =>
  store.users.find((user) => user.email === String(email).toLowerCase());

export const createSession = (store, userId) => {
  const token = crypto.randomBytes(24).toString("hex");
  const session = {
    token,
    userId,
    createdAt: new Date().toISOString(),
  };
  store.sessions.push(session);
  return session;
};

export const getUserByToken = (store, token) => {
  const session = store.sessions.find((item) => item.token === token);
  if (!session) {
    return null;
  }
  return store.users.find((user) => user.id === session.userId) || null;
};

export const removeSession = (store, token) => {
  store.sessions = store.sessions.filter((item) => item.token !== token);
};
