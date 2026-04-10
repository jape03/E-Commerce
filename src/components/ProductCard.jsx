import { Link } from "react-router-dom";

export default function ProductCard({ p, onAdd }) {
  return (
    <div className="card">
      <div className="card-img">
        <img src={p.image} alt={p.title} referrerPolicy="no-referrer" />
      </div>

      <div className="card-body">
        <div>
          <h3 title={p.title}>{p.title}</h3>
          <div className="meta">
            <span>{p.category}</span>
            <span className="price">₱{p.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="card-actions">
          <Link className="btn btn-ghost" to={`/product/${p.id}`}>
            View
          </Link>
          <button className="btn btn-primary" onClick={() => onAdd(p)}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
