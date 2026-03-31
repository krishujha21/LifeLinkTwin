/**
 * LifeLink Twin — AlertsPanel Component
 * Displays active clinical alerts with slide-in animation.
 * Each alert slides in from the right when added.
 * Alerts can be individually dismissed.
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS, formatTime } from '../utils/riskUtils';

// Inject keyframes once
function injectKeyframes() {
    if (document.getElementById('ll-alerts-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'll-alerts-keyframes';
    style.textContent = `
        @keyframes ll-alert-slide-in {
            from { opacity: 0; transform: translateX(24px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ll-alert-slide-out {
            from { opacity: 1; transform: translateX(0);   max-height: 80px; }
            to   { opacity: 0; transform: translateX(24px); max-height: 0; padding: 0; margin: 0; }
        }
        @keyframes ll-alert-critical-flash {
            0%,100% { border-color: #ef444488; }
            50%     { border-color: #ef4444ff; }
        }
    `;
    document.head.appendChild(style);
}

// Classify alert text to determine severity
function classifyAlert(text = '') {
    const lower = text.toLowerCase();
    if (lower.includes('critical') || lower.includes('hypoxemia') || lower.includes('bradycardia') || lower.includes('hypothermia')) {
        return 'critical';
    }
    if (lower.includes('elevated') || lower.includes('fever') || lower.includes('warning') || lower.includes('low oxygen')) {
        return 'warning';
    }
    return 'info';
}

const SEVERITY_CONFIG = {
    critical: { color: COLORS.critical, icon: '🔴', label: 'Critical', bg: 'rgba(239,68,68,0.08)' },
    warning:  { color: COLORS.warning,  icon: '🟡', label: 'Warning',  bg: 'rgba(245,158,11,0.08)' },
    info:     { color: COLORS.accent,   icon: '🔵', label: 'Info',     bg: 'rgba(59,130,246,0.08)' },
};

/**
 * @param {string[]} alerts      - From useSocket().alerts (array of alert strings)
 * @param {string}   patientName - To display in header
 * @param {boolean}  compact     - Reduced height
 */
export default function AlertsPanel({ alerts = [], patientName = 'Patient', compact = false }) {
    // Rich alert objects with metadata
    const [richAlerts, setRichAlerts] = useState([]);
    const [dismissed, setDismissed]   = useState(new Set());
    const seenRef = useRef(new Set());

    useEffect(() => {
        injectKeyframes();
    }, []);

    // Convert incoming string alerts → rich objects with id + timestamp
    useEffect(() => {
        if (!alerts.length) return;

        const newOnes = alerts
            .filter(text => !seenRef.current.has(text))
            .map(text => {
                seenRef.current.add(text);
                return {
                    id:        `${Date.now()}-${Math.random()}`,
                    text,
                    severity:  classifyAlert(text),
                    timestamp: new Date().toISOString(),
                };
            });

        if (newOnes.length > 0) {
            setRichAlerts(prev => [...newOnes, ...prev].slice(0, 10));
        }
    }, [alerts]);

    const dismiss = (id) => {
        setDismissed(prev => new Set([...prev, id]));
        // Remove from list after animation completes
        setTimeout(() => {
            setRichAlerts(prev => prev.filter(a => a.id !== id));
            setDismissed(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 300);
    };

    const clearAll = () => {
        setRichAlerts([]);
        seenRef.current.clear();
    };

    const visible = richAlerts.filter(a => !dismissed.has(a.id));
    const criticalCount = visible.filter(a => a.severity === 'critical').length;

    // ── styles ────────────────────────────────────────────────────────────────
    const panelStyle = {
        background:   COLORS.card,
        border:       `1px solid ${criticalCount > 0 ? COLORS.critical + '66' : COLORS.border}`,
        borderRadius: '12px',
        overflow:     'hidden',
        fontFamily:   '"Inter", sans-serif',
        animation:    criticalCount > 0
            ? 'll-alert-critical-flash 1.5s ease-in-out infinite'
            : 'none',
        transition:   'border-color 0.4s ease',
    };

    const headerStyle = {
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '12px 16px',
        borderBottom:   `1px solid ${COLORS.border}`,
    };

    const feedStyle = {
        maxHeight:    compact ? '200px' : '280px',
        overflowY:    'auto',
        padding:      visible.length ? '8px' : '0',
        display:      'flex',
        flexDirection: 'column',
        gap:          '6px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${COLORS.border} transparent`,
    };

    return (
        <div style={panelStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <span style={{ color: COLORS.text, fontWeight: 600, fontSize: '13px' }}>
                        Active Alerts
                    </span>
                    {/* Count badge */}
                    {visible.length > 0 && (
                        <span style={{
                            background:   criticalCount > 0 ? COLORS.critical : COLORS.warning,
                            color:        '#fff',
                            borderRadius: '20px',
                            padding:      '1px 8px',
                            fontSize:     '11px',
                            fontWeight:   700,
                        }}>
                            {visible.length}
                        </span>
                    )}
                </div>
                {visible.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{
                            background:   'transparent',
                            border:       `1px solid ${COLORS.border}`,
                            borderRadius: '6px',
                            padding:      '3px 10px',
                            color:        COLORS.muted,
                            fontSize:     '11px',
                            cursor:       'pointer',
                            fontFamily:   '"Inter", sans-serif',
                        }}
                        onMouseOver={e => e.currentTarget.style.color = COLORS.text}
                        onMouseOut={e  => e.currentTarget.style.color = COLORS.muted}
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Alerts feed */}
            <div style={feedStyle}>
                {visible.length === 0 ? (
                    <div style={{
                        padding:   '20px 16px',
                        color:     COLORS.muted,
                        fontSize:  '13px',
                        textAlign: 'center',
                        display:   'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap:       '6px',
                    }}>
                        <span style={{ fontSize: '24px' }}>✅</span>
                        No active alerts — {patientName} is stable
                    </div>
                ) : (
                    visible.map(alert => {
                        const conf = SEVERITY_CONFIG[alert.severity];
                        const isOut = dismissed.has(alert.id);
                        return (
                            <div
                                key={alert.id}
                                style={{
                                    display:       'flex',
                                    alignItems:    'flex-start',
                                    gap:           '10px',
                                    background:    conf.bg,
                                    border:        `1px solid ${conf.color}44`,
                                    borderLeft:    `3px solid ${conf.color}`,
                                    borderRadius:  '8px',
                                    padding:       '10px 12px',
                                    animation:     isOut
                                        ? 'll-alert-slide-out 0.3s ease forwards'
                                        : 'll-alert-slide-in 0.35s ease',
                                    overflow:      'hidden',
                                }}
                            >
                                {/* Severity icon */}
                                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                                    {conf.icon}
                                </span>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        color:      COLORS.text,
                                        fontSize:   '13px',
                                        fontWeight: alert.severity === 'critical' ? 600 : 400,
                                        lineHeight: 1.4,
                                    }}>
                                        {alert.text}
                                    </div>
                                    <div style={{ color: COLORS.muted, fontSize: '11px', marginTop: '3px' }}>
                                        {formatTime(alert.timestamp)}
                                        <span style={{
                                            marginLeft:    '8px',
                                            color:          conf.color,
                                            fontWeight:    700,
                                            fontSize:      '10px',
                                            textTransform: 'uppercase',
                                        }}>
                                            {conf.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Dismiss button */}
                                <button
                                    onClick={() => dismiss(alert.id)}
                                    style={{
                                        background:   'transparent',
                                        border:       'none',
                                        color:        COLORS.muted,
                                        cursor:       'pointer',
                                        fontSize:     '14px',
                                        padding:      '0 2px',
                                        flexShrink:   0,
                                        lineHeight:   1,
                                    }}
                                    title="Dismiss"
                                    onMouseOver={e => e.currentTarget.style.color = COLORS.text}
                                    onMouseOut={e  => e.currentTarget.style.color = COLORS.muted}
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
