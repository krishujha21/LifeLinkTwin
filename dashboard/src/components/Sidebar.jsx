/**
 * LifeLink Twin - Sidebar Component
 * 
 * Left navigation sidebar with sliding menu functionality.
 * Collapses on mobile devices.
 */

import { NavLink } from 'react-router-dom';

function Sidebar({ isOpen, onToggle, patientData }) {
    const menuItems = [
        { id: 'dashboard', path: '/', icon: '📊', label: 'Dashboard', badge: null },
        { id: 'vitals', path: '/vitals', icon: '❤️', label: 'Vitals Monitor', badge: 'Live' },
        { id: 'patient', path: '/patient', icon: '👤', label: 'Patient Info', badge: null },
        { id: 'alerts', path: '/alerts', icon: '🚨', label: 'Alerts', badge: '3' },
        { id: 'history', path: '/history', icon: '📈', label: 'History', badge: null },
        { id: 'reports', path: '/reports', icon: '📋', label: 'Reports', badge: null },
        { id: 'settings', path: '/settings', icon: '⚙️', label: 'Settings', badge: null },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay d-lg-none"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="brand-icon">🏥</span>
                        <span className="brand-text">LifeLink</span>
                    </div>
                    <button
                        className="sidebar-close d-lg-none"
                        onClick={onToggle}
                    >
                        ✕
                    </button>
                </div>

                {/* Patient Quick Info */}
                <div className="sidebar-patient-card">
                    <div className="patient-avatar-sm">
                        <span>👤</span>
                    </div>
                    <div className="patient-details">
                        <span className="patient-name-sm">{patientData?.patientName || 'John Doe'}</span>
                        <span className="patient-id-sm">ID: {patientData?.patientId || 'patient1'}</span>
                    </div>
                    <span className={`status-indicator-sm ${patientData?.status === 'critical' ? 'critical' : patientData?.status === 'warning' ? 'warning' : 'online'}`}></span>
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.id} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => window.innerWidth < 992 && onToggle()}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    {item.badge && (
                                        <span className={`nav-badge ${item.badge === 'Live' ? 'live' : ''}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <div className="connection-status-sidebar">
                        <span className="status-dot-sm online"></span>
                        <span>Connected to Server</span>
                    </div>
                    <div className="sidebar-version">
                        <small>v1.0.0 • Digital Twin</small>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
