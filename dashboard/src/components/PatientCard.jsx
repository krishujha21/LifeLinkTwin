/**
 * LifeLink Twin — PatientCard Component
 * Used in the Doctor dashboard left sidebar to list patients.
 * Shows: name, condition, status pill, mini vitals, compact risk gauge.
 * Selected card gets a glowing accent border.
 */

import { COLORS, statusColor, statusBg, riskLabel } from '../utils/riskUtils';
import RiskGauge from './RiskGauge';

/**
 * @param {object}   patient      - Patient data object (see MOCK_PATIENTS)
 * @param {boolean}  isSelected   - Whether this card is currently active
 * @param {function} onSelect     - Callback when card is clicked
 * @param {object}   liveVitals   - Live vitals from socket (for patient1 only)
 * @param {string}   liveStatus   - Live status from socket
 * @param {number}   liveRisk     - Live risk score from socket
 */
export default function PatientCard({
    patient,
    isSelected = false,
    onSelect,
    liveVitals,
    liveStatus,
    liveRisk,
}) {
    // Resolve vitals: prefer live data for real patient, fall back to mock
    const vitals  = patient.live && liveVitals ? liveVitals   : patient.vitals;
    const status  = patient.live && liveStatus ? liveStatus   : patient.status  || 'normal';
    const risk    = patient.live && liveRisk   ? liveRisk     : patient.riskScore || 0;
    const color   = statusColor(status);

    // ── styles ─────────────────────────────────────────────────────────────
    const cardStyle = {
        background:   isSelected
            ? `linear-gradient(135deg, ${color}12, ${COLORS.card})`
            : COLORS.card,
        border:       `1px solid ${isSelected ? color : COLORS.border}`,
        borderRadius: '12px',
        padding:      '14px',
        cursor:       'pointer',
        fontFamily:   '"Inter", sans-serif',
        transition:   'all 0.25s ease',
        boxShadow:    isSelected ? `0 0 16px ${color}22` : 'none',
        position:     'relative',
        overflow:     'hidden',
    };

    // Live pulse indicator for patient1
    const liveDotStyle = {
        display:      'inline-block',
        width:        '6px',
        height:       '6px',
        borderRadius: '50%',
        background:   COLORS.normal,
        boxShadow:    `0 0 4px ${COLORS.normal}`,
        marginRight:  '5px',
        verticalAlign: 'middle',
        animation:    'll-live-pulse 1.5s ease-in-out infinite',
    };

    // Inject live-pulse keyframe
    if (!document.getElementById('ll-pc-keyframes')) {
        const s = document.createElement('style');
        s.id = 'll-pc-keyframes';
        s.textContent = `
            @keyframes ll-live-pulse {
                0%,100% { opacity: 1; transform: scale(1); }
                50%     { opacity: 0.4; transform: scale(0.7); }
            }
        `;
        document.head.appendChild(s);
    }

    const statusPillStyle = {
        display:      'inline-block',
        padding:      '2px 8px',
        borderRadius: '20px',
        fontSize:     '10px',
        fontWeight:   700,
        color:        color,
        background:   `${color}18`,
        border:       `1px solid ${color}44`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    const vitalRowStyle = {
        display:              'grid',
        gridTemplateColumns:  '1fr 1fr 1fr',
        gap:                  '6px',
        marginTop:            '10px',
    };

    const miniVitalStyle = {
        background:   COLORS.bg,
        borderRadius: '8px',
        padding:      '6px 8px',
        textAlign:    'center',
    };

    return (
        <div
            style={cardStyle}
            onClick={onSelect}
            onMouseOver={e => {
                if (!isSelected) {
                    e.currentTarget.style.borderColor = `${color}66`;
                    e.currentTarget.style.background  = `${COLORS.card}`;
                }
            }}
            onMouseOut={e => {
                if (!isSelected) {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.background  = COLORS.card;
                }
            }}
        >
            {/* Selected indicator bar */}
            {isSelected && (
                <div style={{
                    position:     'absolute',
                    left:         0,
                    top:          0,
                    bottom:       0,
                    width:        '3px',
                    background:   color,
                    borderRadius: '3px 0 0 3px',
                    boxShadow:    `0 0 8px ${color}`,
                }} />
            )}

            {/* Top row — name + status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        {patient.live && <span style={liveDotStyle} />}
                        <span style={{ color: COLORS.text, fontWeight: 700, fontSize: '14px' }}>
                            {patient.name}
                        </span>
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: '11px' }}>
                        {patient.age}y · {patient.gender}
                    </div>
                </div>
                <div style={statusPillStyle}>{status}</div>
            </div>

            {/* Condition */}
            <div style={{
                color:       COLORS.muted,
                fontSize:    '11px',
                marginTop:   '6px',
                fontStyle:   'italic',
            }}>
                {patient.condition}
            </div>

            {/* Mini vitals grid */}
            {vitals && (
                <div style={vitalRowStyle}>
                    <div style={miniVitalStyle}>
                        <div style={{ color: COLORS.muted, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>HR</div>
                        <div style={{ color: color, fontWeight: 700, fontSize: '15px' }}>
                            {vitals.heartRate ?? '--'}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '9px' }}>bpm</div>
                    </div>
                    <div style={miniVitalStyle}>
                        <div style={{ color: COLORS.muted, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>SpO₂</div>
                        <div style={{ color: color, fontWeight: 700, fontSize: '15px' }}>
                            {vitals.spo2 ?? '--'}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '9px' }}>%</div>
                    </div>
                    <div style={miniVitalStyle}>
                        <div style={{ color: COLORS.muted, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>Temp</div>
                        <div style={{ color: color, fontWeight: 700, fontSize: '15px' }}>
                            {vitals.temperature ?? '--'}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '9px' }}>°C</div>
                    </div>
                </div>
            )}

            {/* Risk score bar */}
            <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: COLORS.muted, fontSize: '10px' }}>Risk</span>
                    <span style={{ color, fontWeight: 700, fontSize: '10px' }}>{risk}% · {riskLabel(risk)}</span>
                </div>
                <div style={{
                    height:       '4px',
                    background:   COLORS.border,
                    borderRadius: '4px',
                    overflow:     'hidden',
                }}>
                    <div style={{
                        height:     '100%',
                        width:      `${risk}%`,
                        background: color,
                        borderRadius: '4px',
                        boxShadow:  risk > 60 ? `0 0 6px ${color}` : 'none',
                        transition: 'width 0.6s ease, background 0.4s ease',
                    }} />
                </div>
            </div>
        </div>
    );
}
