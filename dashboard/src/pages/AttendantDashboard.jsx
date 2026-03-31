/**
 * LifeLink Twin — Attendant Dashboard
 * Route: /attendant
 * Mobile-first (max-width 480px), family-friendly health tracking view.
 *
 * Layout:
 *  TopBar
 *  ECG Strip
 *  Risk Gauge (centered, large)
 *  4× VitalCard (HR, SpO2, Temp, BP)
 *  AIAssessmentPanel (plain-English)
 *  AlertsPanel
 *  ChatPanel
 *  SOSButton (pinned bottom area)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useSocket         from '../hooks/useSocket';
import useVitalsHistory  from '../hooks/useVitalsHistory';
import { COLORS }        from '../utils/riskUtils';

import TopBar            from '../components/TopBar';
import ECGStrip          from '../components/ECGStrip';
import RiskGauge         from '../components/RiskGauge';
import VitalCard         from '../components/VitalCard';
import AIAssessmentPanel from '../components/AIAssessmentPanel';
import AlertsPanel       from '../components/AlertsPanel';
import ChatPanel         from '../components/ChatPanel';
import SOSButton         from '../components/SOSButton';

export default function AttendantDashboard() {
    const navigate   = useNavigate();
    const name       = localStorage.getItem('ll_name')      || 'Attendant';
    const patientId  = localStorage.getItem('ll_patientId') || 'patient1';

    // Guard: redirect to login if not authenticated
    useEffect(() => {
        if (!localStorage.getItem('ll_role')) navigate('/');
    }, [navigate]);

    // Socket hook
    const {
        vitals,
        status,
        riskScore,
        aiAssessment,
        alerts,
        connected,
        chatMessages,
        sendSOS,
        sendChat,
    } = useSocket(patientId, 'attendant');

    // Rolling vitals history for sparklines
    const { history, pushVitals } = useVitalsHistory();

    useEffect(() => {
        if (vitals) pushVitals(vitals, vitals?.timestamp);
    }, [vitals]);

    // ── derived values ────────────────────────────────────────────────────────
    const hr   = vitals?.heartRate                         ?? '--';
    const spo2 = vitals?.spo2                              ?? '--';
    const temp = vitals?.temperature                       ?? '--';
    const sys  = vitals?.bloodPressure?.systolic           ?? '--';
    const dia  = vitals?.bloodPressure?.diastolic          ?? '--';
    const bpDisplay = sys !== '--' ? `${sys}/${dia}` : '--/--';

    // Translate clinical status → friendly attendant language
    const friendlyStatus = {
        normal:   '😊 Stable & Comfortable',
        warning:  '😟 Needs Attention',
        critical: '🚨 Urgent — Contact Doctor Now',
    }[status] || '⏳ Connecting…';

    const friendlyStatusColor = {
        normal:   COLORS.normal,
        warning:  COLORS.warning,
        critical: COLORS.critical,
    }[status] || COLORS.muted;

    // Translate AI assessment to plain english for family
    const familyAssessment = aiAssessment
        ? aiAssessment
        : status === 'normal'
            ? 'Your loved one is currently stable. All vital signs are within normal range. No immediate action required.'
            : 'Please check with the attending doctor for the latest update.';

    // ── page style ────────────────────────────────────────────────────────────
    const pageStyle = {
        minHeight:   '100vh',
        background:  COLORS.bg,
        fontFamily:  '"Inter", sans-serif',
        color:       COLORS.text,
    };

    const contentStyle = {
        maxWidth:   '480px',
        margin:     '0 auto',
        padding:    '16px 16px 32px',
        display:    'flex',
        flexDirection: 'column',
        gap:        '14px',
    };

    const sectionLabel = (text) => (
        <div style={{
            color:         COLORS.muted,
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom:  '-6px',
        }}>
            {text}
        </div>
    );

    return (
        <div style={pageStyle}>
            {/* Top navigation bar */}
            <TopBar
                title="Family Tracking Portal"
                role="attendant"
                connected={connected}
                status={status}
                patientName={patientId}
            />

            <div style={contentStyle}>

                {/* ── Friendly status banner ─────────────────────────────── */}
                <div style={{
                    background:   `${friendlyStatusColor}15`,
                    border:       `1px solid ${friendlyStatusColor}44`,
                    borderRadius: '12px',
                    padding:      '14px 18px',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '12px',
                    animation:    status === 'critical' ? 'll-warning-pulse 1.5s ease infinite' : 'none',
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: friendlyStatusColor, fontWeight: 700, fontSize: '16px' }}>
                            {friendlyStatus}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '3px' }}>
                            {connected ? 'Live monitoring active' : 'Reconnecting to server…'}
                        </div>
                    </div>
                    <div style={{
                        fontSize:    '32px',
                        animation:   status === 'critical' ? 'll-heartbeat 0.8s ease infinite' : 'none',
                    }}>
                        {status === 'critical' ? '🚨' : status === 'warning' ? '⚠️' : '🫀'}
                    </div>
                </div>

                {/* ── ECG Strip ─────────────────────────────────────────── */}
                <ECGStrip
                    heartRate={vitals?.heartRate}
                    status={status}
                    height={65}
                />

                {/* ── Risk Gauge ────────────────────────────────────────── */}
                {sectionLabel('Overall Risk Level')}
                <RiskGauge score={riskScore} size={180} />

                {/* ── Vitals Grid ───────────────────────────────────────── */}
                {sectionLabel('Live Vital Signs')}
                <div style={{
                    display:             'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap:                 '12px',
                }}>
                    <VitalCard
                        metricKey="heartRate"
                        value={vitals?.heartRate}
                        label="Heart Rate"
                        unit="bpm"
                        icon="❤️"
                        sparkdata={history.heartRate}
                    />
                    <VitalCard
                        metricKey="spo2"
                        value={vitals?.spo2}
                        label="SpO₂"
                        unit="%"
                        icon="🫁"
                        sparkdata={history.spo2}
                    />
                    <VitalCard
                        metricKey="temperature"
                        value={vitals?.temperature}
                        label="Temperature"
                        unit="°C"
                        icon="🌡️"
                        sparkdata={history.temperature}
                    />
                    {/* Blood Pressure — combined display */}
                    <div style={{
                        background:   COLORS.card,
                        border:       `1px solid ${COLORS.border}`,
                        borderRadius: '12px',
                        padding:      '20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>💉</span>
                            <span style={{ color: COLORS.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Blood Pressure
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '28px', fontWeight: 800, color: COLORS.text }}>{sys}</span>
                            <span style={{ color: COLORS.muted, fontSize: '14px' }}>/</span>
                            <span style={{ fontSize: '22px', fontWeight: 700, color: COLORS.muted }}>{dia}</span>
                            <span style={{ color: COLORS.muted, fontSize: '12px', marginLeft: '2px' }}>mmHg</span>
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '11px' }}>Systolic / Diastolic</div>
                    </div>
                </div>

                {/* ── AI Assessment (family-friendly) ─────────────────────── */}
                {sectionLabel('Doctor\'s AI Summary')}
                <AIAssessmentPanel
                    assessment={familyAssessment}
                    status={status}
                    timestamp={vitals?.timestamp}
                />

                {/* ── Active Alerts ─────────────────────────────────────── */}
                {alerts.length > 0 && (
                    <>
                        {sectionLabel('Active Alerts')}
                        <AlertsPanel alerts={alerts} patientName={patientId} compact />
                    </>
                )}

                {/* ── Chat with doctor ─────────────────────────────────── */}
                {sectionLabel('Chat with Doctor')}
                <ChatPanel
                    messages={chatMessages}
                    onSend={sendChat}
                    senderName={name}
                    role="attendant"
                />

                {/* ── SOS Button ────────────────────────────────────────── */}
                {sectionLabel('Emergency')}
                <SOSButton onSOS={() => sendSOS(name)} />

            </div>
        </div>
    );
}
