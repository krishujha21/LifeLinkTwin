/**
 * LifeLink Twin - Login Page Component
 * 
 * Secure login page with authentication
 */

import { useState } from 'react';
import { useLanguage } from '../i18n';
import { API_BASE_URL } from '../config/api';

function Login({ onLogin }) {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user, data.token);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (user, pass) => {
        setUsername(user);
        setPassword(pass);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">🏥</span>
                        <h1>LifeLink Twin</h1>
                    </div>
                    <p className="login-subtitle">Emergency Health Monitoring System</p>
                </div>

                <div className="login-body">
                    {error && (
                        <div className="login-alert error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">
                                <span className="label-icon">👤</span> Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <span className="label-icon">🔒</span> Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    🔐 Login
                                </>
                            )}
                        </button>
                    </form>

                    <div className="demo-credentials">
                        <h4>🔑 Demo Credentials</h4>
                        <div className="credential-list">
                            <button
                                type="button"
                                className="credential-btn"
                                onClick={() => fillCredentials('admin', 'admin123')}
                            >
                                <span className="role-icon">👤</span>
                                <div className="credential-info">
                                    <span className="credential-user">admin</span>
                                    <span className="credential-role">System Administrator</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="credential-btn"
                                onClick={() => fillCredentials('doctor', 'doctor123')}
                            >
                                <span className="role-icon">👨‍⚕️</span>
                                <div className="credential-info">
                                    <span className="credential-user">doctor</span>
                                    <span className="credential-role">Medical Doctor</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="credential-btn"
                                onClick={() => fillCredentials('nurse', 'nurse123')}
                            >
                                <span className="role-icon">👩‍⚕️</span>
                                <div className="credential-info">
                                    <span className="credential-user">nurse</span>
                                    <span className="credential-role">Nursing Staff</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p>🔒 Secure Authentication • Hashed Passwords</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
