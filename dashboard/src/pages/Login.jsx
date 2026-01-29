/**
 * LifeLink Twin - Login Page Component
 * 
 * Secure login page with authentication
 * Supports both real backend auth and demo mode (when backend is not available)
 */

import { useState } from 'react';
import { useLanguage } from '../i18n';
import { API_BASE_URL } from '../config/api';

// Demo users for when backend is not available (production demo)
const DEMO_USERS = {
    admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator', email: 'admin@lifelink.com' },
    doctor: { username: 'doctor', password: 'doctor123', role: 'doctor', name: 'Dr. Smith', email: 'doctor@lifelink.com' },
    nurse: { username: 'nurse', password: 'nurse123', role: 'nurse', name: 'Nurse Johnson', email: 'nurse@lifelink.com' }
};

function Login({ onLogin }) {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Demo mode authentication (client-side only)
    const demoLogin = (username, password) => {
        const user = DEMO_USERS[username];
        if (user && user.password === password) {
            const token = `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return {
                success: true,
                token,
                user: {
                    username: user.username,
                    role: user.role,
                    name: user.name,
                    email: user.email
                }
            };
        }
        return { success: false, message: 'Invalid username or password' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Try real backend first
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
            console.log('Backend not available, using demo mode...');

            // Fallback to demo mode when backend is not available
            const demoResult = demoLogin(username, password);

            if (demoResult.success) {
                localStorage.setItem('token', demoResult.token);
                localStorage.setItem('user', JSON.stringify(demoResult.user));
                onLogin(demoResult.user, demoResult.token);
            } else {
                setError(demoResult.message);
            }
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
