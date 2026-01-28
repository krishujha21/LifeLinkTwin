/**
 * LifeLink Twin - Error Boundary Component
 * 
 * Catches React errors and displays fallback UI
 * instead of crashing the whole app (white screen fix)
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container" style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0e17',
                    color: '#fff',
                    padding: '20px'
                }}>
                    <div className="text-center">
                        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</h1>
                        <h2>Something went wrong</h2>
                        <p className="text-muted mb-4">
                            LifeLink Twin encountered an error. Please refresh the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary btn-lg"
                        >
                            🔄 Refresh Page
                        </button>

                        {/* Error details for debugging */}
                        {this.state.error && (
                            <details style={{
                                marginTop: '30px',
                                textAlign: 'left',
                                backgroundColor: '#1a1f2e',
                                padding: '15px',
                                borderRadius: '8px',
                                maxWidth: '600px'
                            }}>
                                <summary style={{ cursor: 'pointer', color: '#f59e0b' }}>
                                    🐛 Error Details (for developers)
                                </summary>
                                <pre style={{
                                    color: '#ef4444',
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    marginTop: '10px'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                                <pre style={{
                                    color: '#9ca3af',
                                    fontSize: '11px',
                                    overflow: 'auto'
                                }}>
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
