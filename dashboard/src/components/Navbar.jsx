/**
 * LifeLink Twin - Navbar Component
 * 
 * Top navigation bar with hamburger menu toggle,
 * connection status, theme toggle, language selector, patient selector, and current time display.
 * Pan India multi-language support.
 * Role-based display for different user types.
 */

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n';
import { getRoleDisplayName, getRoleIcon, isMedicalRole, isAdminRole } from '../utils/rbac';

// Language configurations with native names
const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
];

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
    allPatientsData,
    user,
    onLogout
}) {
    // Language context
    const { language, changeLanguage, t } = useLanguage();

    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [date, setDate] = useState(new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }));

    // Language dropdown state
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [langSearch, setLangSearch] = useState('');
    const langDropdownRef = useRef(null);

    // Notification dropdown state
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const notifDropdownRef = useRef(null);

    // Sample notifications
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'critical', title: 'Critical Alert', message: 'Patient AMB-001 heart rate exceeds 130 BPM', time: '2 min ago', read: false },
        { id: 2, type: 'warning', title: 'Warning', message: 'SpO2 levels dropping for Patient AMB-003', time: '5 min ago', read: false },
        { id: 3, type: 'info', title: 'System Update', message: 'New ambulance AMB-006 connected to network', time: '10 min ago', read: false },
        { id: 4, type: 'success', title: 'Patient Stable', message: 'AMB-002 vitals returned to normal', time: '15 min ago', read: true },
        { id: 5, type: 'info', title: 'Shift Change', message: 'Dr. Smith has logged in', time: '20 min ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Get current language
    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    // Filter languages based on search
    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(langSearch.toLowerCase())
    );

    // Show only 5 results at a time
    const displayedLanguages = filteredLanguages.slice(0, 5);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
                setLangSearch('');
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setNotifDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleLanguageSelect = (langCode) => {
        changeLanguage(langCode);
        setLangDropdownOpen(false);
        setLangSearch('');
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
                    <span className="title-text">{t('lifelinkTwin')}</span>
                </div>

                {/* Breadcrumb - visible on desktop */}
                <div className="navbar-breadcrumb d-none d-lg-flex">
                    <span className="breadcrumb-item">{t('dashboard')}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-item active">{t('liveMonitor')}</span>
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

                {/* Language Selector Dropdown */}
                <div className="language-selector me-2" ref={langDropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="lang-trigger-btn d-flex align-items-center gap-2"
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>🌐</span>
                        <span className="d-none d-md-inline">{currentLang.nativeName}</span>
                        <span style={{
                            fontSize: '0.6rem',
                            transition: 'transform 0.2s',
                            transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>▼</span>
                    </button>

                    {langDropdownOpen && (
                        <div
                            className="lang-dropdown-menu"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px var(--shadow-color)',
                                zIndex: 1000,
                                minWidth: '220px',
                                overflow: 'hidden',
                                animation: 'slideDown 0.2s ease'
                            }}
                        >
                            {/* Search Input */}
                            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder={`🔍 ${t('searchLanguage')}`}
                                        value={langSearch}
                                        onChange={(e) => setLangSearch(e.target.value)}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--bg-input)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                                    {filteredLanguages.length} {t('languagesFound')}
                                </small>
                            </div>

                            {/* Language List - Max 5 visible */}
                            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                {displayedLanguages.length > 0 ? (
                                    displayedLanguages.map(lang => (
                                        <div
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            style={{
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                backgroundColor: lang.code === language ? 'var(--accent-blue)' : 'transparent',
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background-color 0.15s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (lang.code !== language) {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = lang.code === language ? 'var(--accent-blue)' : 'transparent';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: '500',
                                                    color: lang.code === language ? '#fff' : 'var(--text-primary)',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {lang.nativeName}
                                                </div>
                                                <small style={{
                                                    color: lang.code === language ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {lang.name}
                                                </small>
                                            </div>
                                            {lang.code === language && (
                                                <span style={{ color: '#fff' }}>✓</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No languages found
                                    </div>
                                )}

                                {filteredLanguages.length > 5 && (
                                    <div style={{
                                        padding: '8px 16px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        backgroundColor: 'var(--bg-input)'
                                    }}>
                                        +{filteredLanguages.length - 5} more • Type to search
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
                <div className="notification-wrapper" ref={notifDropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="notification-btn"
                        onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    >
                        <span className="notification-icon">🔔</span>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {notifDropdownOpen && (
                        <div className="notification-dropdown">
                            <div className="notif-header">
                                <h4>🔔 Notifications</h4>
                                {unreadCount > 0 && (
                                    <button
                                        className="mark-all-read"
                                        onClick={markAllAsRead}
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <span>✨</span>
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notif-item ${notif.type} ${notif.read ? 'read' : 'unread'}`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="notif-icon">
                                                {notif.type === 'critical' ? '🔴' :
                                                    notif.type === 'warning' ? '🟡' :
                                                        notif.type === 'success' ? '🟢' : '🔵'}
                                            </div>
                                            <div className="notif-content">
                                                <div className="notif-title">{notif.title}</div>
                                                <div className="notif-message">{notif.message}</div>
                                                <div className="notif-time">{notif.time}</div>
                                            </div>
                                            <button
                                                className="notif-close"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearNotification(notif.id);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="notif-footer">
                                <button className="view-all-btn">
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu with Logout */}
                <div className="user-menu">
                    <div className="user-info d-none d-md-flex">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{getRoleDisplayName(user?.role) || 'Guest'}</span>
                    </div>
                    <div className="user-avatar">
                        <span>{getRoleIcon(user?.role)}</span>
                    </div>
                    <button className="logout-btn" onClick={onLogout} title="Logout">
                        <span>🚪</span>
                        <span className="d-none d-sm-inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
