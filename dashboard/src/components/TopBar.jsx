/**
 * LifeLink Twin — TopBar Component
 * Shared navigation bar across all three dashboards.
 * Shows: logo | page title | connection dot | user info | logout
 */

import { useNavigate } from 'react-router-dom';
import { COLORS, statusColor } from '../utils/riskUtils';

/**
 * @param {string}  title       - Page title (e.g. "Family Tracking Portal")
 * @param {string}  role        - 'attendant' | 'doctor' | 'hospital'
 * @param {boolean} connected   - WebSocket connection status
 * @param {string}  status      - 'normal' | 'warning' | 'critical' (for patient status dot)
 * @param {string}  patientName - Currently tracked patient name
 */
export default function TopBar({ title, role, connected, status = 'normal', patientName }) {
    const navigate  = useNavigate();
    const name      = localStorage.getItem('ll_name') || 'User';

    const roleIcon = {
        attendant: '👨‍👩‍👧‍👦',
        doctor:    '👨‍⚕️',
        hospital:  '🏥',
    }[role] || '👤';

    const roleLabel = {
        attendant: 'Attendant',
        doctor:    'Doctor',
        hospital:  'Hospital Admin',
    }[role] || role;

    const handleLogout = () => {
        localStorage.removeItem('ll_role');
        localStorage.removeItem('ll_name');
        localStorage.removeItem('ll_patientId');
        navigate('/');
    };

    // ── styles ───────────────────────────────────────────────────────────────
    const barStyle = {
        position:       'sticky',
        top:            0,
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 24px',
        height:         '60px',
        background:     'rgba(13,20,36,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom:   `1px solid ${COLORS.border}`,
        fontFamily:     '"Inter", sans-serif',
        gap:            '12px',
    };

    // Connection status pulse
    const dotStyle = {
        width:        '8px',
        height:       '8px',
        borderRadius: '50%',
        background:   connected ? COLORS.normal : COLORS.critical,
        boxShadow:    connected
            ? `0 0 6px ${COLORS.normal}`
            : `0 0 6px ${COLORS.critical}`,
        flexShrink:   0,
        animation:    connected ? 'none' : 'criticalPulse 1s infinite',
    };

    // Patient status indicator pill
    const pillStyle = {
        padding:      '3px 10px',
        borderRadius: '20px',
        fontSize:     '11px',
        fontWeight:   700,
        color:        statusColor(status),
        background:   `${statusColor(status)}22`,
        border:       `1px solid ${statusColor(status)}55`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    };

    const btnStyle = {
        background:   'transparent',
        border:       `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding:      '6px 12px',
        color:        COLORS.muted,
        fontSize:     '12px',
        cursor:       'pointer',
        transition:   'all 0.2s',
        fontFamily:   '"Inter", sans-serif',
    };

    return (
        <nav style={barStyle}>
            {/* LEFT — logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>🫀</span>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        color:     COLORS.text,
                        fontWeight: 700,
                        fontSize:  '15px',
                        whiteSpace: 'nowrap',
                        overflow:  'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {title}
                    </div>
                    {patientName && (
                        <div style={{ color: COLORS.muted, fontSize: '11px', marginTop: '1px' }}>
                            Monitoring: <span style={{ color: COLORS.accent }}>{patientName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER — status pill (hidden on small screens via opacity trick) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {/* Connection dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={dotStyle} />
                    <span style={{ color: COLORS.muted, fontSize: '11px' }}>
                        {connected ? 'Live' : 'Offline'}
                    </span>
                </div>

                {/* Patient status pill — only if status provided */}
                {status !== 'normal' && (
                    <div style={pillStyle}>
                        {status}
                    </div>
                )}
            </div>

            {/* RIGHT — user info + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>
                        {roleIcon} {name}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: '11px' }}>
                        {roleLabel}
                    </div>
                </div>
                <button
                    style={btnStyle}
                    onClick={handleLogout}
                    onMouseOver={e => {
                        e.currentTarget.style.borderColor = COLORS.critical;
                        e.currentTarget.style.color = COLORS.critical;
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.color = COLORS.muted;
                    }}
                    title="Logout"
                >
                    ✕ Exit
                </button>
            </div>
        </nav>
    );
}
