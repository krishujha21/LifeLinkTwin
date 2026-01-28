/**
 * LifeLink Twin - Navbar Component
 * 
 * Top navigation bar with hamburger menu toggle,
 * connection status, theme toggle, patient selector, and current time display.
 */

import { useState, useEffect } from 'react';

function Navbar({
    connected,
    status,
    onMenuToggle,
    sidebarOpen,
    simulatorOn,
    onToggleSimulator,
    theme,
    onToggleTheme,
    patients,
    selectedPatientId,
    onSelectPatient,
    allPatientsData
}) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [date, setDate] = useState(new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusBadgeClass = () => {
        switch (status) {
            case 'critical': return 'badge-critical';
            case 'warning': return 'badge-warning';
            default: return 'badge-normal';
        }
    };

    // Get status indicator for each patient
    const getPatientStatusDot = (patientId) => {
        const data = allPatientsData?.[patientId];
        if (!data) return '⚪';
        switch (data.status) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            default: return '🟢';
        }
    };

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                {/* Hamburger Menu Button */}
                <button
                    className={`hamburger-btn ${sidebarOpen ? 'active' : ''}`}
                    onClick={onMenuToggle}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Page Title - visible on mobile */}
                <div className="navbar-title d-lg-none">
                    <span className="title-icon">🏥</span>
                    <span className="title-text">LifeLink Twin</span>
                </div>

                {/* Breadcrumb - visible on desktop */}
                <div className="navbar-breadcrumb d-none d-lg-flex">
                    <span className="breadcrumb-item">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-item active">Live Monitor</span>
                </div>
            </div>

            <div className="navbar-right">
                {/* Patient Selector Dropdown */}
                {simulatorOn && patients && patients.length > 0 && (
                    <div className="patient-selector me-2">
                        <select
                            className="form-select form-select-sm patient-dropdown"
                            value={selectedPatientId}
                            onChange={(e) => onSelectPatient(e.target.value)}
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '6px 30px 6px 10px',
                                fontSize: '0.8rem',
                                minWidth: '200px',
                                cursor: 'pointer'
                            }}
                        >
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {getPatientStatusDot(patient.id)} {patient.name} ({patient.ambulance})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    className="theme-toggle-btn"
                    onClick={onToggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Simulator Toggle */}
                <div className="simulator-toggle d-flex align-items-center gap-2 me-3">
                    <span className="d-none d-md-inline text-muted" style={{ fontSize: '0.75rem' }}>
                        🎮 Simulator
                    </span>
                    <button
                        className={`btn btn-sm ${simulatorOn ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={onToggleSimulator}
                        style={{
                            minWidth: '60px',
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            fontWeight: 'bold'
                        }}
                    >
                        {simulatorOn ? '🟢 ON' : '⚫ OFF'}
                    </button>
                </div>

                {/* Patient Status */}
                <div className={`status-badge ${getStatusBadgeClass()}`}>
                    <span className="status-dot"></span>
                    <span className="status-text d-none d-sm-inline text-uppercase fw-bold">
                        {status || 'WAITING'}
                    </span>
                </div>

                {/* Connection Status */}
                <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
                    <span className="indicator-dot"></span>
                    <span className="d-none d-md-inline">{connected ? 'LIVE' : 'OFFLINE'}</span>
                </div>

                {/* Date & Time */}
                <div className="datetime-display d-none d-sm-flex">
                    <span className="date-text">{date}</span>
                    <span className="time-text">{time}</span>
                </div>

                {/* Notifications */}
                <button className="notification-btn">
                    <span className="notification-icon">🔔</span>
                    <span className="notification-badge">3</span>
                </button>

                {/* User Avatar */}
                <div className="user-avatar">
                    <span>👨‍⚕️</span>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
