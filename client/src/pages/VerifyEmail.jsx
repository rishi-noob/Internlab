import { useLocation, Link } from 'react-router-dom';

export default function VerifyEmail() {
    const location = useLocation();
    const email = location.state?.email || 'your email address';

    return (
        <div className="auth-page">
            <div className="animated-bg" />
            <div className="auth-card" style={{ textAlign: 'center', maxWidth: 450 }}>
                <div className="brand-area">
                    <div className="brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                    <h1 style={{ marginBottom: '1rem' }}>Verify Your Email</h1>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    We've sent a verification link to <strong>{email}</strong>. 
                </p>
                
                <div style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--primary-light)', fontSize: '0.95rem' }}>
                        Please check your inbox and click the link to activate your account.
                    </p>
                </div>

                <Link to="/login" className="btn btn-primary btn-block" style={{ textDecoration: 'none' }}>
                    Go to Login
                </Link>
                
                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    (If you don't see the email, check your spam folder)
                </p>
            </div>
        </div>
    );
}
