import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary, #faf8f5)',
                    padding: '20px',
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: 480,
                        padding: '48px 32px',
                        borderRadius: 16,
                        background: 'var(--bg-secondary, #fff)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: 'var(--text-primary, #1a1a2e)',
                            marginBottom: 8,
                        }}>
                            Something went wrong
                        </h1>
                        <p style={{
                            fontSize: 14,
                            color: 'var(--text-secondary, #666)',
                            marginBottom: 28,
                            lineHeight: 1.6,
                        }}>
                            An unexpected error occurred. Please try reloading the page. If the problem persists, contact support.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'var(--accent, #6C63FF)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                🔄 Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border, #e0dcd5)',
                                    background: 'transparent',
                                    color: 'var(--text-primary, #1a1a2e)',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                🏠 Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
