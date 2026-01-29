/**
 * LifeLink Twin - Sidebar Component
 * 
 * Left navigation sidebar with sliding menu functionality.
 * Collapses on mobile devices.
 * Implements role-based access control to show different menus for different roles.
 */

import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { isMenuItemAllowed, isMedicalRole, isAdminRole, getRoleIcon } from '../utils/rbac';

function Sidebar({ isOpen, onToggle, patientData, userRole }) {
    const { t } = useLanguage();

    // All menu items - will be filtered based on role
    const allMenuItems = [
        { id: 'dashboard', path: '/', icon: '📊', labelKey: 'dashboard', badge: null },

        // Patient Care Section (Medical Staff - Doctor/Nurse)
        { id: 'divider-patient', isDivider: true, label: 'PATIENT CARE', roles: ['doctor', 'nurse'] },
        { id: 'vitals', path: '/vitals', icon: '❤️', labelKey: 'vitalsMonitor', badge: 'live', roles: ['doctor', 'nurse'] },
        { id: 'patient', path: '/patient', icon: '👤', labelKey: 'patientInfo', badge: null, roles: ['doctor', 'nurse'] },
        { id: 'alerts', path: '/alerts', icon: '🚨', labelKey: 'alerts', badge: '3', roles: ['doctor', 'nurse'] },
        { id: 'history', path: '/history', icon: '📈', labelKey: 'history', badge: null, roles: ['doctor', 'nurse'] },
        { id: 'reports', path: '/reports', icon: '📋', labelKey: 'reports', badge: null, roles: ['doctor', 'nurse'] },

        // Network & Infrastructure (Admin Only)
        { id: 'divider2', isDivider: true, label: 'System Infrastructure', roles: ['admin'] },
        { id: 'edgecloud', path: '/edgecloud', icon: '☁️', labelKey: 'edgeCloud', badge: null, roles: ['admin'] },
        { id: 'qos', path: '/qos', icon: '📡', labelKey: 'networkQoS', badge: null, roles: ['admin'] },
        { id: 'edgefailure', path: '/edgefailure', icon: '🔄', labelKey: 'edgeFailureBackup', badge: null, roles: ['admin'] },
        { id: 'national', path: '/national', icon: '🌐', labelKey: 'nationalNetwork', badge: null, roles: ['admin'] },
        { id: 'scenario', path: '/scenario', icon: '▶️', labelKey: 'scenarioPlayback', badge: null, roles: ['admin'] },

        { id: 'divider4', isDivider: true },
        { id: 'settings', path: '/settings', icon: '⚙️', labelKey: 'settings', badge: null },
    ];

    // Filter menu items based on user role
    const menuItems = useMemo(() => {
        return allMenuItems.filter(item => {
            // Dashboard and settings are available to all
            if (item.id === 'dashboard' || item.id === 'settings' || item.id === 'divider4') {
                return true;
            }

            // If item has specific roles, check if user's role matches
            if (item.roles) {
                if (isMedicalRole(userRole) && (item.roles.includes('doctor') || item.roles.includes('nurse'))) {
                    return true;
                }
                if (isAdminRole(userRole) && item.roles.includes('admin')) {
                    return true;
                }
                return false;
            }

            // Check regular items using RBAC
            return isMenuItemAllowed(userRole, item.id);
        });
    }, [userRole]);

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

                {/* Patient Quick Info (Medical Staff Only) */}
                {isMedicalRole(userRole) && (
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
                )}

                {/* System Status Card (Admin Only) */}
                {isAdminRole(userRole) && (
                    <div className="sidebar-patient-card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0d47a1 100%)' }}>
                        <div className="patient-avatar-sm">
                            <span>🔧</span>
                        </div>
                        <div className="patient-details">
                            <span className="patient-name-sm">System Status</span>
                            <span className="patient-id-sm">Infrastructure Monitor</span>
                        </div>
                        <span className="status-indicator-sm online"></span>
                    </div>
                )}

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
