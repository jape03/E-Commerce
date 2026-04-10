import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) {
        return;
      }
      setLoading(true);
      try {
        const data = await api.getOrders();
        setOrders(data.items);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleDetails = (orderId) => {
    setExpanded((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="container">
      <div className="panel">
        <h2>My Orders</h2>
        {loading ? <p>Loading orders...</p> : null}
        {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}

        {!loading && !error && orders.length === 0 ? (
          <div>
            <p style={{ color: "var(--text-light)", marginBottom: "16px" }}>No orders yet.</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {orders.map((order) => (
              <div key={order.id} className="panel" style={{ border: "1px solid var(--border)", boxShadow: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{order.id}</strong>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-light)" }}>
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} item(s) | {order.paymentMethod.toUpperCase()} | {order.status}
                </div>
                <div style={{ fontWeight: "700", color: "var(--shopee-orange)" }}>
                  Total: PHP {order.summary.total.toLocaleString()}
                </div>

                <button
                  type="button"
                  className="btn"
                  style={{
                    marginTop: "12px",
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    textTransform: "none",
                    padding: "8px 14px",
                  }}
                  onClick={() => toggleDetails(order.id)}
                >
                  {expanded[order.id] ? "Hide Details" : "View Details"}
                </button>

                {expanded[order.id] ? (
                  <div style={{ marginTop: "14px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ marginBottom: "10px", fontWeight: "600" }}>Products Ordered</div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.id}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            padding: "10px",
                          }}
                        >
                          <div style={{ display: "flex", gap: "10px" }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "4px" }}
                            />
                            <div>
                              <div style={{ fontWeight: "600" }}>{item.name}</div>
                              <div style={{ color: "var(--text-light)", fontSize: "12px" }}>
                                Qty: {item.qty} | Unit Price: PHP {item.price.toLocaleString()}
                                {item.originalPrice > item.price ? (
                                  <>
                                    {" "}
                                    <span style={{ textDecoration: "line-through" }}>
                                      (Orig: PHP {item.originalPrice.toLocaleString()})
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {item.originalPrice > item.price ? (
                              <div style={{ color: "var(--text-light)", fontSize: "12px", textDecoration: "line-through" }}>
                                PHP {(item.originalPrice * item.qty).toLocaleString()}
                              </div>
                            ) : null}
                            <div style={{ fontWeight: "700", color: "var(--shopee-orange)" }}>
                              PHP {item.lineTotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const originalSubtotal = order.items.reduce(
                        (sum, item) => sum + (Number(item.originalPrice ?? item.price) * Number(item.qty ?? 0)),
                        0
                      );
                      const productSavings = Math.max(0, originalSubtotal - order.summary.subtotal);
                      const voucherSavings = Number(order.summary.discount ?? 0);
                      const shippingSavings = Number(order.summary.shipping ?? 0) === 0 ? 50 : 0;
                      const totalSavings = productSavings + voucherSavings + shippingSavings;

                      return (
                        <div style={{ marginTop: "14px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                          <div style={{ fontWeight: "600", marginBottom: "8px" }}>Payment Summary</div>
                          <div style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--text-light)" }}>Original Items Total</span>
                              <span>PHP {originalSubtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--text-light)" }}>Product Discounts</span>
                              <span>-PHP {productSavings.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--text-light)" }}>Items Subtotal</span>
                              <span>PHP {order.summary.subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--text-light)" }}>Shipping Fee</span>
                              <span>
                                {order.summary.shipping === 0 ? "FREE" : `PHP ${order.summary.shipping.toLocaleString()}`}
                              </span>
                            </div>
                            {order.summary.discount > 0 ? (
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-light)" }}>Voucher Discount</span>
                                <span>-PHP {order.summary.discount.toLocaleString()}</span>
                              </div>
                            ) : null}
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                              <span>Total Paid</span>
                              <span style={{ color: "var(--shopee-orange)" }}>
                                PHP {order.summary.total.toLocaleString()}
                              </span>
                            </div>
                            {totalSavings > 0 ? (
                              <div style={{ color: "var(--shopee-orange)", fontWeight: "700", marginTop: "4px" }}>
                                You saved PHP {totalSavings.toLocaleString()}
                                {shippingSavings > 0 ? ` (includes PHP ${shippingSavings} free shipping)` : ""}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{ marginTop: "12px", color: "var(--text-light)", fontSize: "13px" }}>
                      <div>Customer: {order.customer?.name}</div>
                      <div>Email: {order.customer?.email}</div>
                      <div>Phone: {order.customer?.phone}</div>
                      <div>
                        Address: {order.customer?.address}, {order.customer?.city}, {order.customer?.postal}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
