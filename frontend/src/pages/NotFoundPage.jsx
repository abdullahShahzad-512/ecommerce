import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container page-enter" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="empty-state">
        <p style={{ fontSize: '6rem', lineHeight: 1 }}>404</p>
        <h2 className="heading-1">Page Not Found</h2>
        <p style={{ color: 'var(--color-ink-3)', maxWidth: 380, margin: '0 auto' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/products" className="btn btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}