import { Link } from "react-router-dom";

export default function Navbar({ query, setQuery, cartCount, user, onLogout }) {
  return (
    <>
      <nav className="nav">
        <div className="nav-top">
          <div className="nav-top-links">
            {user ? (
              <>
                <span>Hi, {user.name}</span>
                <Link to="/orders">My Orders</Link>
                <button
                  type="button"
                  onClick={onLogout}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">Login / Register</Link>
            )}
          </div>
        </div>

        <div className="nav-inner">
          <Link to="/" className="brand">
            <div className="brand-badge">shop</div>
          </Link>

          <div className="search">
            <input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-btn" />
          </div>

          <Link to={user ? "/cart" : "/login"} className="pill">
            <span className="badge">{cartCount}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
