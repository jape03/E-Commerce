import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container">
      <div className="panel" style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        maxWidth: '600px',
        margin: '60px auto'
      }}>
        <div style={{ 
          fontSize: '120px', 
          marginBottom: '20px',
          opacity: 0.5
        }}>
          🔍
        </div>
        <h1 style={{ 
          margin: '0 0 16px',
          fontSize: '48px',
          fontWeight: '800',
          color: 'var(--shopee-orange)'
        }}>
          404
        </h1>
        <h2 style={{ 
          margin: '0 0 12px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Page Not Found
        </h2>
        <p style={{ 
          color: 'var(--text-light)', 
          marginBottom: '32px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          Sorry, the page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back to shopping!
        </p>
        <Link to="/">
          <button className="btn btn-primary" style={{ 
            padding: '14px 32px',
            fontSize: '15px',
            textTransform: 'none'
          }}>
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
