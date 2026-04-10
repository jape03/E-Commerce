import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function Product({ onAdd, user }) {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [single, all] = await Promise.all([api.getProduct(id), api.getProducts({ sortBy: "popular" })]);
        setProduct(single.item);
        setProducts(all.items);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    };

    run();
  }, [id]);

  const recommended = useMemo(() => products.filter((item) => item.id !== Number(id)).slice(0, 6), [products, id]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    setBusy(true);
    setAddError("");
    try {
      await onAdd(product, qty);
      setQty(1);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="panel">Unable to load product: {error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="panel">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          background: "white",
          borderRadius: "4px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ fontSize: "13px", color: "var(--text-light)", marginBottom: "20px" }}>
          <Link to="/" style={{ color: "var(--shopee-orange)" }}>
            Home
          </Link>{" "}
          / {product.category} / {product.name}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "400px 1fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          <div>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                background: "#f8f8f8",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border)",
                position: "relative",
              }}
            >
              <div className="discount-badge" style={{ fontSize: "14px", padding: "6px 12px" }}>
                -{product.discount}% OFF
              </div>
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            </div>
          </div>

          <div>
            <h1 style={{ margin: "0 0 16px", fontSize: "24px", fontWeight: "500", lineHeight: "1.4" }}>{product.name}</h1>

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <span style={{ fontWeight: "600" }}>{product.rating}</span>
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-light)" }}>{product.reviews} Ratings</div>
              <div style={{ fontSize: "14px", color: "var(--text-light)" }}>{product.sold} Sold</div>
            </div>

            <div style={{ background: "var(--bg)", padding: "20px", borderRadius: "4px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                <div className="price" style={{ fontSize: "32px" }}>
                  PHP {product.price.toLocaleString()}
                </div>
                <div className="price-original" style={{ fontSize: "16px" }}>
                  PHP {product.originalPrice.toLocaleString()}
                </div>
                <div
                  style={{
                    background: "var(--shopee-orange)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "2px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {product.discount}% OFF
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", color: "var(--text-light)", marginBottom: "12px" }}>Quantity</div>
              <div className="qty" style={{ display: "inline-flex" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <span style={{ marginLeft: "16px", fontSize: "14px", color: "var(--text-light)" }}>{product.stock} available</span>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <button
                onClick={handleAddToCart}
                disabled={busy}
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: "15px", textTransform: "none" }}
              >
                {busy ? "Adding..." : user ? "Add to Cart" : "Login to Add"}
              </button>
            </div>
            {addError ? <p style={{ color: "#b42318", marginBottom: "12px" }}>{addError}</p> : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                padding: "16px",
                background: "var(--bg)",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <div>
                <div style={{ color: "var(--text-light)", marginBottom: "4px" }}>Location</div>
                <div style={{ fontWeight: "500" }}>{product.location}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-light)", marginBottom: "4px" }}>Shipping</div>
                <div style={{ fontWeight: "500", color: "var(--shopee-orange)" }}>FREE over PHP 299</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px", background: "var(--bg)", borderRadius: "4px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>Product Description</h3>
          <p style={{ margin: "0", lineHeight: "1.6", color: "var(--text-light)" }}>{product.description}</p>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <div className="section-title">
          <h2>You May Also Like</h2>
        </div>
        <div className="grid">
          {recommended.map((item) => (
            <Link to={`/product/${item.id}`} key={item.id} className="card">
              <div className="card-img">
                <div className="discount-badge">-{item.discount}%</div>
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
              </div>
              <div className="card-body">
                <h3>{item.name}</h3>
                <div className="price-row">
                  <div className="price">PHP {item.price.toLocaleString()}</div>
                  <div className="price-original">PHP {item.originalPrice.toLocaleString()}</div>
                </div>
                <div className="meta">
                  <span className="sold-count">{item.sold} sold</span>
                  <span className="location">{item.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
