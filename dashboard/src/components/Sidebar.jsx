/**
 * LifeLink Twin - Sidebar Component
 * 
 * Left navigation sidebar with sliding menu functionality.
 * Collapses on mobile devices.
 */

import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n';

function Sidebar({ isOpen, onToggle, patientData }) {
    const { t } = useLanguage();

    const menuItems = [
        { id: 'dashboard', path: '/', icon: '📊', labelKey: 'dashboard', badge: null },
        { id: 'vitals', path: '/vitals', icon: '❤️', labelKey: 'vitalsMonitor', badge: 'live' },
        { id: 'patient', path: '/patient', icon: '👤', labelKey: 'patientInfo', badge: null },
        { id: 'alerts', path: '/alerts', icon: '🚨', labelKey: 'alerts', badge: '3' },
        { id: 'history', path: '/history', icon: '📈', labelKey: 'history', badge: null },
        { id: 'reports', path: '/reports', icon: '📋', labelKey: 'reports', badge: null },

        // Advanced Features Section
        { id: 'divider1', isDivider: true, label: 'Advanced Features' },
        { id: 'predictive', path: '/predictive', icon: '🔮', labelKey: 'predictiveHealth', badge: 'AI' },
        { id: 'ambulance', path: '/ambulance', icon: '🚑', labelKey: 'ambulanceTracker', badge: 'live' },
        { id: 'multipatient', path: '/multipatient', icon: '👥', labelKey: 'multiPatient', badge: null },
        { id: 'twin', path: '/twin', icon: '🤖', labelKey: 'digitalTwin', badge: null },
        { id: 'ai', path: '/ai', icon: '🧠', labelKey: 'aiExplanation', badge: 'AI' },
        { id: 'handover', path: '/handover', icon: '📄', labelKey: 'handoverReport', badge: null },

        // Network & Infrastructure
        { id: 'divider2', isDivider: true, label: 'Network & Infrastructure' },
        { id: 'edgecloud', path: '/edgecloud', icon: '☁️', labelKey: 'edgeCloud', badge: null },
        { id: 'qos', path: '/qos', icon: '📡', labelKey: 'networkQoS', badge: null },
        { id: 'edgefailure', path: '/edgefailure', icon: '🔄', labelKey: 'edgeFailureBackup', badge: null },
        { id: 'national', path: '/national', icon: '🌐', labelKey: 'nationalNetwork', badge: null },

        // Emergency & Management
        { id: 'divider3', isDivider: true, label: 'Emergency & Management' },
        { id: 'escalation', path: '/escalation', icon: '⚠️', labelKey: 'emergencyEscalation', badge: null },
        { id: 'hospital', path: '/hospital', icon: '🏥', labelKey: 'hospitalReadiness', badge: null },
        { id: 'scenario', path: '/scenario', icon: '▶️', labelKey: 'scenarioPlayback', badge: null },

        { id: 'divider4', isDivider: true },
        { id: 'settings', path: '/settings', icon: '⚙️', labelKey: 'settings', badge: null },
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
                        <span className="brand-text">{t('lifelinkTwin')}</span>
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
                            item.isDivider ? (
                                <li key={item.id} className="nav-divider">
                                    {item.label && <span className="nav-divider-label">{item.label}</span>}
                                </li>
                            ) : (
                                <li key={item.id} className="nav-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                        onClick={() => window.innerWidth < 992 && onToggle()}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{t(item.labelKey)}</span>
                                        {item.badge && (
                                            <span className={`nav-badge ${item.badge === 'live' ? 'live' : item.badge === 'AI' ? 'ai' : ''}`}>
                                                {item.badge === 'live' ? t('live') : item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                </li>
                            )
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
