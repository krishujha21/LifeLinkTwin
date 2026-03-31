/**
 * LifeLink Twin — Doctor Dashboard
 * Route: /doctor
 *
 * Layout:
 *  TopBar (with SOS alert banner underneath when triggered)
 *  ┌────────────────────────────────────────────┐
 *  │  Left Sidebar (260px)  │  Right Main Panel  │
 *  │  Patient List          │  Selected patient  │
 *  │  - PatientCard × 3    │  ECG Strip         │
 *  │                        │  4× VitalCards     │
 *  │                        │  RiskGauge         │
 *  │                        │  AIAssessment      │
 *  │                        │  Alerts            │
 *  │                        │  Chat              │
 *  └────────────────────────────────────────────┘
 */

import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';

import useSocket         from '../hooks/useSocket';
import useVitalsHistory  from '../hooks/useVitalsHistory';
import { COLORS, statusColor } from '../utils/riskUtils';

import TopBar            from '../components/TopBar';
import PatientCard       from '../components/PatientCard';
import ECGStrip          from '../components/ECGStrip';
import RiskGauge         from '../components/RiskGauge';
import VitalCard         from '../components/VitalCard';
import AIAssessmentPanel from '../components/AIAssessmentPanel';
import AlertsPanel       from '../components/AlertsPanel';
import ChatPanel         from '../components/ChatPanel';

// ── Mock patient data (patient2 + patient3 are static) ────────────────────────
const MOCK_PATIENTS = [
    {
        id:        'patient1',
        name:      'Divvya Singh',
        age:       28,
        gender:    'Female',
        condition: 'Cardiac Monitoring',
        live:      true,
    },
    {
        id:        'patient2',
        name:      'Priya Sharma',
        age:       34,
        gender:    'Female',
        condition: 'Post-Surgery',
        vitals:    { heartRate: 78, spo2: 98, temperature: 37.1, bloodPressure: { systolic: 118, diastolic: 76 } },
        status:    'normal',
        riskScore: 12,
        live:      false,
    },
    {
        id:        'patient3',
        name:      'Raj Kumar',
        age:       67,
        gender:    'Male',
        condition: 'Diabetes Management',
        vitals:    { heartRate: 112, spo2: 92, temperature: 38.8, bloodPressure: { systolic: 158, diastolic: 95 } },
        status:    'critical',
        riskScore: 78,
        live:      false,
    },
];

export default function DoctorDashboard() {
    const navigate            = useNavigate();
    const doctorName          = localStorage.getItem('ll_name') || 'Doctor';
    const [selectedId, setSelectedId] = useState('patient1');

    // Guard
    useEffect(() => {
        if (!localStorage.getItem('ll_role')) navigate('/');
    }, [navigate]);

    // Socket — doctor role receives all patient data
    const {
        vitals:       liveVitals,
        status:       liveStatus,
        riskScore:    liveRisk,
        aiAssessment: liveAI,
        alerts:       liveAlerts,
        connected,
        sosReceived,
        chatMessages,
        sendChat,
        clearSOS,
    } = useSocket('patient1', 'doctor');

    // Vitals history for sparklines
    const { history, pushVitals, clearHistory } = useVitalsHistory();

    useEffect(() => {
        if (liveVitals && selectedId === 'patient1') {
            pushVitals(liveVitals, liveVitals?.timestamp);
        }
    }, [liveVitals, selectedId]);

    // Reset history when switching patients
    useEffect(() => {
        clearHistory();
    }, [selectedId]);

    // ── Resolve selected patient data ─────────────────────────────────────────
    const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedId);
    const isLive          = selectedPatient?.live;

    const vitals   = isLive ? liveVitals              : selectedPatient?.vitals;
    const status   = isLive ? liveStatus              : selectedPatient?.status  || 'normal';
    const risk     = isLive ? liveRisk                : selectedPatient?.riskScore || 0;
    const ai       = isLive ? liveAI                  : 'Patient stable. Routine post-operative monitoring in progress. No immediate intervention required.';
    const alerts   = isLive ? liveAlerts              : [];

    const accentColor = statusColor(status);

    // ── SOS banner ────────────────────────────────────────────────────────────
    const SOSBanner = sosReceived && (
        <div
            style={{
                background:   'rgba(239,68,68,0.15)',
                border:       `1px solid ${COLORS.critical}`,
                borderRadius: '10px',
                padding:      '12px 20px',
                margin:       '12px 20px 0',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                gap:          '12px',
                animation:    'll-critical-pulse 1s ease infinite',
            }}
        >
            <div>
                <span style={{ color: COLORS.critical, fontWeight: 800, fontSize: '15px' }}>
                    🆘 SOS ALERT — {sosReceived.name || 'Attendant'} has triggered an emergency!
                </span>
                <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '3px' }}>
                    Patient: {sosReceived.patientId} · {new Date(sosReceived.timestamp).toLocaleTimeString()}
                </div>
            </div>
            <button
                onClick={clearSOS}
                style={{
                    background:   COLORS.critical,
                    border:       'none',
                    borderRadius: '8px',
                    padding:      '8px 16px',
                    color:        '#fff',
                    fontWeight:   700,
                    fontSize:     '13px',
                    cursor:       'pointer',
                    fontFamily:   '"Inter", sans-serif',
                    flexShrink:   0,
                }}
            >
                Acknowledge ✓
            </button>
        </div>
    );

    // ── styles ────────────────────────────────────────────────────────────────
    const pageStyle = {
        minHeight:  '100vh',
        background: COLORS.bg,
        fontFamily: '"Inter", sans-serif',
        color:      COLORS.text,
        display:    'flex',
        flexDirection: 'column',
    };

    const bodyStyle = {
        display:  'flex',
        flex:     1,
        overflow: 'hidden',
        height:   'calc(100vh - 60px)',
    };

    const sidebarStyle = {
        width:          '270px',
        flexShrink:     0,
        borderRight:    `1px solid ${COLORS.border}`,
        overflowY:      'auto',
        padding:        '16px 12px',
        display:        'flex',
        flexDirection:  'column',
        gap:            '10px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${COLORS.border} transparent`,
        background:     'rgba(13,20,36,0.6)',
    };

    const mainStyle = {
        flex:      1,
        overflowY: 'auto',
        padding:   '20px',
        display:   'flex',
        flexDirection: 'column',
        gap:       '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${COLORS.border} transparent`,
    };

    const sectionLabel = (text) => (
        <div style={{
            color:         COLORS.muted,
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
        }}>
            {text}
        </div>
    );

    return (
        <div style={pageStyle}>
            {/* Top bar */}
            <TopBar
                title="Clinical Dashboard"
                role="doctor"
                connected={connected}
                status={status}
                patientName={selectedPatient?.name}
            />

            {/* SOS Alert Banner */}
            {SOSBanner}

            {/* Main body */}
            <div style={bodyStyle}>

                {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
                <div style={sidebarStyle}>
                    <div style={{
                        color:      COLORS.text,
                        fontWeight: 700,
                        fontSize:   '13px',
                        padding:    '4px 4px 8px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '6px',
                    }}>
                        <span>🏥</span> My Patients
                        <span style={{
                            marginLeft:   'auto',
                            background:   COLORS.border,
                            borderRadius: '20px',
                            padding:      '1px 8px',
                            fontSize:     '11px',
                            color:        COLORS.muted,
                        }}>
                            {MOCK_PATIENTS.length}
                        </span>
                    </div>

                    {MOCK_PATIENTS.map(p => (
                        <PatientCard
                            key={p.id}
                            patient={p}
                            isSelected={selectedId === p.id}
                            onSelect={() => setSelectedId(p.id)}
                            liveVitals={liveVitals}
                            liveStatus={liveStatus}
                            liveRisk={liveRisk}
                        />
                    ))}

                    {/* Sidebar footer */}
                    <div style={{
                        marginTop:  'auto',
                        paddingTop: '12px',
                        borderTop:  `1px solid ${COLORS.border}`,
                        color:      COLORS.muted,
                        fontSize:   '11px',
                        textAlign:  'center',
                    }}>
                        👨‍⚕️ Dr. {doctorName}<br />
                        <span style={{ color: connected ? COLORS.normal : COLORS.critical }}>
                            {connected ? '● Server connected' : '● Reconnecting…'}
                        </span>
                    </div>
                </div>

                {/* ── RIGHT MAIN PANEL ─────────────────────────────────── */}
                <div style={mainStyle}>

                    {/* Patient header */}
                    <div style={{
                        background:   `${accentColor}10`,
                        border:       `1px solid ${accentColor}44`,
                        borderRadius: '12px',
                        padding:      '16px 20px',
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent: 'space-between',
                        flexWrap:     'wrap',
                        gap:          '12px',
                    }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '20px', color: COLORS.text }}>
                                {isLive && <span style={{ color: COLORS.normal, marginRight: '8px', fontSize: '14px', verticalAlign: 'middle' }}>●</span>}
                                {selectedPatient?.name}
                            </div>
                            <div style={{ color: COLORS.muted, fontSize: '13px', marginTop: '2px' }}>
                                {selectedPatient?.age}y · {selectedPatient?.gender} · {selectedPatient?.condition}
                            </div>
                        </div>
                        <div style={{
                            display:    'flex',
                            alignItems: 'center',
                            gap:        '16px',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: accentColor, fontWeight: 800, fontSize: '24px' }}>{risk}</div>
                                <div style={{ color: COLORS.muted, fontSize: '10px' }}>Risk Score</div>
                            </div>
                            <div style={{
                                padding:      '6px 16px',
                                borderRadius: '20px',
                                background:   `${accentColor}20`,
                                border:       `1px solid ${accentColor}66`,
                                color:        accentColor,
                                fontWeight:   700,
                                fontSize:     '13px',
                                textTransform: 'uppercase',
                            }}>
                                {status}
                            </div>
                        </div>
                    </div>

                    {/* ECG Strip */}
                    <ECGStrip heartRate={vitals?.heartRate} status={status} height={72} />

                    {/* Vitals + Risk gauge side by side */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {/* Vitals grid */}
                        <div style={{
                            flex:                1,
                            display:             'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap:                 '12px',
                            minWidth:            '260px',
                        }}>
                            <VitalCard metricKey="heartRate"   value={vitals?.heartRate}   label="Heart Rate"    unit="bpm" icon="❤️"  sparkdata={history.heartRate} />
                            <VitalCard metricKey="spo2"        value={vitals?.spo2}         label="SpO₂"          unit="%"   icon="🫁"  sparkdata={history.spo2} />
                            <VitalCard metricKey="temperature" value={vitals?.temperature}  label="Temperature"   unit="°C"  icon="🌡️" sparkdata={history.temperature} />
                            <VitalCard metricKey="systolic"    value={vitals?.bloodPressure?.systolic} label="Systolic BP" unit="mmHg" icon="💉" sparkdata={history.systolic} />
                        </div>

                        {/* Risk gauge */}
                        <div style={{ flexShrink: 0 }}>
                            <RiskGauge score={risk} size={170} />
                        </div>
                    </div>

                    {/* AI Assessment */}
                    {sectionLabel('AI Clinical Assessment')}
                    <AIAssessmentPanel
                        assessment={ai}
                        status={status}
                        timestamp={vitals?.timestamp}
                    />

                    {/* Alerts + Chat side by side on wider screens */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                            {sectionLabel('Active Alerts')}
                            <div style={{ marginTop: '8px' }}>
                                <AlertsPanel alerts={alerts} patientName={selectedPatient?.name} compact />
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                            {sectionLabel('Chat with Attendant')}
                            <div style={{ marginTop: '8px' }}>
                                <ChatPanel
                                    messages={chatMessages}
                                    onSend={sendChat}
                                    senderName={`Dr. ${doctorName}`}
                                    role="doctor"
                                    compact
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
