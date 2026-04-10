import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { api, authStorage } from "./lib/api";
import Login from "./pages/Login";
import Orders from "./pages/Orders";

export default function App() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({ items: [], summary: { subtotal: 0, shipping: 50, discount: 0, total: 50 } });
  const [cartBusy, setCartBusy] = useState(false);
  const [cartError, setCartError] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const cartCount = useMemo(() => cart.items.reduce((s, i) => s + i.qty, 0), [cart.items]);
  const resetCart = () => setCart({ items: [], summary: { subtotal: 0, shipping: 50, discount: 0, total: 50 } });

  const handleAuthError = (message) => {
    const normalized = String(message || "").toLowerCase();
    if (normalized.includes("unauthorized") || normalized.includes("invalid session")) {
      authStorage.clearToken();
      setUser(null);
      resetCart();
      setCartError("Session expired. Please log in again.");
    }
  };

  const refreshCart = async () => {
    if (!authStorage.getToken()) {
      resetCart();
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
      setCartError("");
    } catch (err) {
      handleAuthError(err.message);
      setCartError(err.message);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const me = await api.me();
        setUser(me.user);
        await refreshCart();
      } catch {
        authStorage.clearToken();
        setUser(null);
        resetCart();
      } finally {
        setAuthReady(true);
      }
    };
    bootstrap();
  }, []);

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      navigate("/login");
      throw new Error("Please log in first before adding products to cart.");
    }
    setCartBusy(true);
    try {
      const data = await api.addCartItem({ productId: product.id, qty });
      setCart(data);
      setCartError("");
    } catch (err) {
      handleAuthError(err.message);
      setCartError(err.message);
      throw err;
    } finally {
      setCartBusy(false);
    }
  };

  const updateQty = async (id, qty) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCartBusy(true);
    try {
      const data = await api.updateCartItem({ productId: id, qty });
      setCart(data);
      setCartError("");
    } catch (err) {
      handleAuthError(err.message);
      setCartError(err.message);
    } finally {
      setCartBusy(false);
    }
  };

  const remove = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCartBusy(true);
    try {
      const data = await api.removeCartItem(id);
      setCart(data);
      setCartError("");
    } catch (err) {
      handleAuthError(err.message);
      setCartError(err.message);
    } finally {
      setCartBusy(false);
    }
  };

  const onAuthSuccess = async ({ user: nextUser, token }) => {
    authStorage.setToken(token);
    setUser(nextUser);
    await refreshCart();
    navigate("/");
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout failures and still clear local auth state.
    } finally {
      authStorage.clearToken();
      setUser(null);
      resetCart();
      navigate("/login");
    }
  };

  if (!authReady) {
    return <div className="container"><div className="panel">Loading session...</div></div>;
  }

  return (
    <>
      <Navbar query={query} setQuery={setQuery} cartCount={cartCount} user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home query={query} />} />
        <Route path="/product/:id" element={<Product onAdd={addToCart} user={user} />} />
        <Route
          path="/cart"
          element={
            <Cart
              user={user}
              cart={cart}
              cartBusy={cartBusy}
              cartError={cartError}
              onUpdateQty={updateQty}
              onRemove={remove}
            />
          }
        />
        <Route path="/checkout" element={<Checkout user={user} cart={cart} onOrderPlaced={refreshCart} />} />
        <Route path="/login" element={<Login onAuthSuccess={onAuthSuccess} user={user} />} />
        <Route path="/orders" element={<Orders user={user} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
