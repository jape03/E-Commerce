import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Home({ query }) {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft] = useState({ hours: 2, minutes: 34, seconds: 52 });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [filtered, featured] = await Promise.all([
          api.getProducts({ query, category, sortBy }),
          api.getProducts({ sortBy: "popular" }),
        ]);
        setProducts(filtered.items);
        setFlashProducts(featured.items.slice(0, 6));
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query, category, sortBy]);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-main">
          <div className="hero-content">
            <div className="hero-label">Limited Time Offer</div>
            <h1>12.12 Mega Sale</h1>
            <p>Up to 80% OFF on thousands of products. Free shipping on orders over PHP 299.</p>
            <div className="hero-cta">
              <button className="btn btn-primary">Shop Now</button>
              <button className="btn btn-ghost">View Deals</button>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="voucher-card">
            <div className="voucher-info">
              <h4>PHP 100 OFF Voucher</h4>
              <p>Min. spend PHP 500</p>
            </div>
          </div>
          <div className="voucher-card">
            <div className="voucher-info">
              <h4>Free Shipping</h4>
              <p>No min. spend</p>
            </div>
          </div>
          <div className="voucher-card">
            <div className="voucher-info">
              <h4>Cashback 20%</h4>
              <p>Max PHP 200</p>
            </div>
          </div>
          <div className="kpi">
            <div>
              <strong>10K+</strong>
              <span>Products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flash-sale">
        <div className="flash-sale-header">
          <div className="flash-sale-title">
            <h2>Flash Sale</h2>
            <div className="flash-timer">
              <div className="timer-box">{String(timeLeft.hours).padStart(2, "0")}</div>
              <span className="timer-sep">:</span>
              <div className="timer-box">{String(timeLeft.minutes).padStart(2, "0")}</div>
              <span className="timer-sep">:</span>
              <div className="timer-box">{String(timeLeft.seconds).padStart(2, "0")}</div>
            </div>
          </div>
        </div>
        <div className="grid">
          {flashProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="card">
              <div className="card-img">
                <div className="discount-badge">-{product.discount}%</div>
                <img src={product.image} alt={product.name} referrerPolicy="no-referrer" />
              </div>
              <div className="card-body">
                <h3>{product.name}</h3>
                <div className="price-row">
                  <div className="price">PHP {product.price.toLocaleString()}</div>
                  <div className="price-original">PHP {product.originalPrice.toLocaleString()}</div>
                </div>
                <div className="meta">
                  <span className="sold-count">{product.sold} sold</span>
                  <span className="location">{product.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="section-title">
        <h2>Top Products</h2>
        <div className="filters">
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Beauty">Beauty</option>
            <option value="Sports">Sports</option>
            <option value="Home">Home</option>
          </select>
          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {error ? <p className="panel">Failed to load products: {error}</p> : null}
      {loading ? <p className="panel">Loading products...</p> : null}

      {!loading && !error ? (
        <div className="grid">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="card">
              <div className="card-img">
                {product.sold > 1000 ? <div className="card-badge">Top Sale</div> : null}
                <div className="discount-badge">-{product.discount}%</div>
                <img src={product.image} alt={product.name} referrerPolicy="no-referrer" />
              </div>
              <div className="card-body">
                <h3>{product.name}</h3>
                <div className="price-row">
                  <div className="price">PHP {product.price.toLocaleString()}</div>
                  <div className="price-original">PHP {product.originalPrice.toLocaleString()}</div>
                </div>
                <div className="meta">
                  <span className="sold-count">{product.sold} sold</span>
                  <span className="location">{product.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
