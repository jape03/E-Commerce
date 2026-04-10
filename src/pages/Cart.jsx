import { Link } from "react-router-dom";

export default function Cart({ user, cart, cartBusy, cartError, onUpdateQty, onRemove }) {
  const { items, summary } = cart;

  if (!user) {
    return (
      <div className="container">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Login Required</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
            Please log in to view your cart and place orders.
          </p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>Add some products to get started.</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="two-col">
        <div className="panel">
          <h2>Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})</h2>
          {cartError ? <p style={{ color: "#b42318", marginBottom: "16px" }}>{cartError}</p> : null}
          {cartBusy ? <p style={{ marginBottom: "16px", color: "var(--text-light)" }}>Syncing cart...</p> : null}

          <div className="cart-header">
            <div></div>
            <div>Product</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
            <div></div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="row">
              <div></div>
              <div className="row-content">
                <div className="row-img">
                  <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                </div>
                <div className="row-info">
                  <h4>{item.name}</h4>
                  <p>Category: {item.category}</p>
                </div>
              </div>

              <div className="row-price">PHP {item.price.toLocaleString()}</div>

              <div className="qty">
                <button onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))} disabled={item.qty <= 1 || cartBusy}>
                  -
                </button>
                <span>{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, item.qty + 1)} disabled={cartBusy}>
                  +
                </button>
              </div>

              <div className="row-price" style={{ color: "var(--shopee-orange)", fontWeight: "700" }}>
                PHP {item.lineTotal.toLocaleString()}
              </div>

              <div className="row-delete" onClick={() => onRemove(item.id)}>
                Remove
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span className="muted">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>PHP {summary.subtotal.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span className="muted">Shipping Fee</span>
            <span>{summary.shipping === 0 ? <span style={{ color: "var(--shopee-orange)" }}>FREE</span> : `PHP ${summary.shipping}`}</span>
          </div>

          {summary.discount > 0 ? (
            <div className="summary-row">
              <span className="muted">Voucher Discount</span>
              <span style={{ color: "var(--shopee-orange)" }}>-PHP {summary.discount}</span>
            </div>
          ) : null}

          <div className="summary-row total">
            <span>Total</span>
            <span className="price">PHP {summary.total.toLocaleString()}</span>
          </div>

          <Link to="/checkout">
            <button className="btn-checkout">Proceed to Checkout</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
