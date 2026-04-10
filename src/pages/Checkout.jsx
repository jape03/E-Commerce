import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Checkout({ user, cart, onOrderPlaced }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const { items, summary } = cart;

  if (!user) {
    return (
      <div className="container">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Login Required</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
            You must log in before placing an order.
          </p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await api.createOrder({
        customer: formData,
        paymentMethod,
      });
      setOrderId(response.order.id);
      await onOrderPlaced();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    return (
      <div className="container">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Order placed successfully</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "12px" }}>Reference: {orderId}</p>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
            Your order is now being processed. You can continue shopping.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>No items to checkout</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>Add products to your cart first.</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ fontSize: "13px", color: "var(--text-light)", marginBottom: "20px" }}>
        <Link to="/cart" style={{ color: "var(--shopee-orange)" }}>
          Cart
        </Link>{" "}
        / Checkout
      </div>

      <div className="two-col">
        <div className="panel">
          <h2>Shipping Information</h2>
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label>Full Name *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label>Email Address *</label>
                <input
                  type="email"
                  className="input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className="input"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Complete Address *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label>City *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label>Postal Code *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.postal}
                  onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: "32px", padding: "20px", background: "var(--bg)", borderRadius: "4px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit or Debit Card</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Online Banking</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div
              key={item.id}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}
            >
              <div>
                <div>{item.name}</div>
                <div style={{ color: "var(--text-light)", fontSize: "12px" }}>Qty: {item.qty}</div>
              </div>
              <div>PHP {item.lineTotal.toLocaleString()}</div>
            </div>
          ))}

          <div className="summary-row">
            <span className="muted">Subtotal</span>
            <span>PHP {summary.subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Shipping Fee</span>
            <span>{summary.shipping === 0 ? "FREE" : `PHP ${summary.shipping}`}</span>
          </div>
          {summary.discount > 0 ? (
            <div className="summary-row">
              <span className="muted">Voucher Discount</span>
              <span>-PHP {summary.discount}</span>
            </div>
          ) : null}
          <div className="summary-row total">
            <span>Total Payment</span>
            <span className="price">PHP {summary.total.toLocaleString()}</span>
          </div>

          {error ? <p style={{ color: "#b42318", marginTop: "12px" }}>{error}</p> : null}
          <button type="submit" form="checkout-form" className="btn-checkout" disabled={busy}>
            {busy ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
