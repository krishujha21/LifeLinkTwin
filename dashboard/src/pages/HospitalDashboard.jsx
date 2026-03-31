/**
 * LifeLink Twin — Hospital Admin Dashboard
 * Route: /hospital
 * Management overview: bed occupancy, doctor status, patient breakdown,
 * resource allocation. All mock data — no socket required.
 */

import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { COLORS, statusColor } from '../utils/riskUtils';
import TopBar                  from '../components/TopBar';

// ── Mock hospital data ────────────────────────────────────────────────────────
const HOSPITAL_DATA = {
    beds:       { total: 60, occupied: 45 },
    icu:        { total: 10, occupied: 8  },
    doctors:    { total: 8,  onDuty: 5   },
    patients:   { critical: 3, warning: 7, normal: 35 },
    emergency:  { today: 12, pending: 2  },
    ambulances: { total: 6,  active: 3   },
};

const DOCTORS = [
    { name: 'Dr. Aisha Kapoor',  speciality: 'Cardiology',    patients: 4, status: 'on-duty'  },
    { name: 'Dr. Rahul Mehta',   speciality: 'ICU',           patients: 3, status: 'on-duty'  },
    { name: 'Dr. Preethi Nair',  speciality: 'General',       patients: 5, status: 'on-duty'  },
    { name: 'Dr. Sanjay Verma',  speciality: 'Neurology',     patients: 2, status: 'on-duty'  },
    { name: 'Dr. Kavya Iyer',    speciality: 'Endocrinology', patients: 6, status: 'on-duty'  },
    { name: 'Dr. Ravi Anand',    speciality: 'Cardiology',    patients: 0, status: 'off-duty' },
    { name: 'Dr. Meena Raj',     speciality: 'General',       patients: 0, status: 'off-duty' },
    { name: 'Dr. Arjun Singh',   speciality: 'Surgery',       patients: 0, status: 'off-duty' },
];

const RECENT_ADMISSIONS = [
    { id: 'P001', name: 'Divvya Singh',  age: 28, condition: 'Cardiac Monitoring',    ward: 'ICU',     status: 'warning'  },
    { id: 'P002', name: 'Raj Kumar',     age: 67, condition: 'Diabetes Management',   ward: 'ICU',     status: 'critical' },
    { id: 'P003', name: 'Priya Sharma',  age: 34, condition: 'Post-Surgery',          ward: 'General', status: 'normal'   },
    { id: 'P004', name: 'Anil Gupta',    age: 55, condition: 'Hypertension',          ward: 'General', status: 'warning'  },
    { id: 'P005', name: 'Sunita Devi',   age: 42, condition: 'Pneumonia',             ward: 'Isolation',status: 'normal'  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, glow }) {
    return (
        <div style={{
            background:   COLORS.card,
            border:       `1px solid ${color ? color + '44' : COLORS.border}`,
            borderRadius: '12px',
            padding:      '20px',
            fontFamily:   '"Inter", sans-serif',
            boxShadow:    glow ? `0 0 20px ${color}18` : 'none',
            transition:   'box-shadow 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '22px' }}>{icon}</span>
                <span style={{ color: color || COLORS.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                </span>
            </div>
            <div style={{ color: color || COLORS.text, fontSize: '36px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value}
            </div>
            {sub && <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '6px' }}>{sub}</div>}
        </div>
    );
}

function OccupancyBar({ label, occupied, total, color }) {
    const pct = Math.round((occupied / total) * 100);
    const barColor = pct >= 90 ? COLORS.critical : pct >= 70 ? COLORS.warning : COLORS.normal;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>{label}</span>
                <span style={{ color: barColor, fontSize: '13px', fontWeight: 700 }}>
                    {occupied}/{total} <span style={{ color: COLORS.muted, fontWeight: 400 }}>({pct}%)</span>
                </span>
            </div>
            <div style={{ height: '8px', background: COLORS.border, borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                    height:     '100%',
                    width:      `${pct}%`,
                    background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
                    borderRadius: '8px',
                    boxShadow:  pct >= 90 ? `0 0 8px ${barColor}` : 'none',
                    transition: 'width 0.8s ease',
                }} />
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HospitalDashboard() {
    const navigate = useNavigate();
    const adminName = localStorage.getItem('ll_name') || 'Admin';
    const [tick, setTick] = useState(0); // For live clock

    useEffect(() => {
        if (!localStorage.getItem('ll_role')) navigate('/');
        const t = setInterval(() => setTick(n => n + 1), 60000); // refresh timestamp
        return () => clearInterval(t);
    }, [navigate]);

    const now = new Date().toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit'
    });

    // ── styles ──────────────────────────────────────────────────────────────
    const pageStyle = {
        minHeight:  '100vh',
        background: COLORS.bg,
        fontFamily: '"Inter", sans-serif',
        color:      COLORS.text,
    };

    const contentStyle = {
        maxWidth: '1200px',
        margin:   '0 auto',
        padding:  '24px 20px 40px',
        display:  'flex',
        flexDirection: 'column',
        gap:      '24px',
    };

    const sectionTitle = (text, sub) => (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ color: COLORS.text, fontWeight: 700, fontSize: '16px' }}>{text}</div>
            {sub && <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '2px' }}>{sub}</div>}
        </div>
    );

    const gridStyle = (cols) => ({
        display:             'grid',
        gridTemplateColumns: cols || 'repeat(auto-fit, minmax(180px, 1fr))',
        gap:                 '14px',
    });

    return (
        <div style={pageStyle}>
            <TopBar title="Hospital Operations Centre" role="hospital" connected={true} patientName={now} />

            <div style={contentStyle}>

                {/* ── Header summary ─────────────────────────────────────── */}
                <div style={{
                    background:   'rgba(59,130,246,0.06)',
                    border:       `1px solid ${COLORS.accent}33`,
                    borderRadius: '12px',
                    padding:      '16px 24px',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'space-between',
                    flexWrap:     'wrap',
                    gap:          '12px',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '20px' }}>
                            🏥 LifeLink General Hospital
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: '13px', marginTop: '2px' }}>
                            Admin: {adminName} · {now}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '6px 14px', borderRadius: '8px', background: `${COLORS.critical}20`, border: `1px solid ${COLORS.critical}44`, color: COLORS.critical, fontWeight: 700, fontSize: '13px' }}>
                            🔴 {HOSPITAL_DATA.patients.critical} Critical
                        </div>
                        <div style={{ padding: '6px 14px', borderRadius: '8px', background: `${COLORS.warning}20`, border: `1px solid ${COLORS.warning}44`, color: COLORS.warning, fontWeight: 700, fontSize: '13px' }}>
                            🟡 {HOSPITAL_DATA.patients.warning} Warning
                        </div>
                        <div style={{ padding: '6px 14px', borderRadius: '8px', background: `${COLORS.normal}20`, border: `1px solid ${COLORS.normal}44`, color: COLORS.normal, fontWeight: 700, fontSize: '13px' }}>
                            🟢 {HOSPITAL_DATA.patients.normal} Stable
                        </div>
                    </div>
                </div>

                {/* ── Key Stats ─────────────────────────────────────────── */}
                <div>
                    {sectionTitle('Key Metrics', 'Real-time hospital status')}
                    <div style={gridStyle('repeat(auto-fit, minmax(160px, 1fr))')}>
                        <StatCard icon="🛏️"  label="Total Beds"         value={`${HOSPITAL_DATA.beds.occupied}/${HOSPITAL_DATA.beds.total}`} sub="Beds occupied"   color={COLORS.accent}   />
                        <StatCard icon="🏥"  label="ICU"                value={`${HOSPITAL_DATA.icu.occupied}/${HOSPITAL_DATA.icu.total}`}   sub="ICU beds in use" color={COLORS.warning}  glow />
                        <StatCard icon="👨‍⚕️" label="Doctors"            value={HOSPITAL_DATA.doctors.onDuty}  sub={`of ${HOSPITAL_DATA.doctors.total} on duty`} color={COLORS.normal} />
                        <StatCard icon="🚨"  label="Emergency Today"    value={HOSPITAL_DATA.emergency.today} sub={`${HOSPITAL_DATA.emergency.pending} pending`}  color={COLORS.critical} glow />
                        <StatCard icon="🚑"  label="Ambulances Active"  value={HOSPITAL_DATA.ambulances.active} sub={`of ${HOSPITAL_DATA.ambulances.total} fleet`} color={COLORS.accent} />
                        <StatCard icon="📊"  label="Total Patients"     value={HOSPITAL_DATA.patients.critical + HOSPITAL_DATA.patients.warning + HOSPITAL_DATA.patients.normal} sub="Admitted" color={COLORS.muted} />
                    </div>
                </div>

                {/* ── Occupancy + Patient breakdown ─────────────────────── */}
                <div style={gridStyle('1fr 1fr')}>

                    {/* Occupancy bars */}
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '20px' }}>
                        {sectionTitle('Bed Occupancy', 'By ward type')}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <OccupancyBar label="General Ward" occupied={25} total={32} />
                            <OccupancyBar label="ICU"          occupied={8}  total={10} />
                            <OccupancyBar label="Emergency"    occupied={7}  total={8}  />
                            <OccupancyBar label="Isolation"    occupied={5}  total={10} />
                        </div>
                    </div>

                    {/* Patient status donut visual (pure CSS) */}
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '20px' }}>
                        {sectionTitle('Patient Status Distribution')}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            {[
                                { label: 'Critical', count: HOSPITAL_DATA.patients.critical, color: COLORS.critical, total: 45 },
                                { label: 'Warning',  count: HOSPITAL_DATA.patients.warning,  color: COLORS.warning,  total: 45 },
                                { label: 'Stable',   count: HOSPITAL_DATA.patients.normal,   color: COLORS.normal,   total: 45 },
                            ].map(({ label, count, color, total }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color, fontWeight: 700, fontSize: '13px', width: '60px' }}>
                                        {label}
                                    </div>
                                    <div style={{ flex: 1, height: '10px', background: COLORS.border, borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${(count / total) * 100}%`,
                                            background: color, borderRadius: '10px',
                                            boxShadow: `0 0 6px ${color}88`,
                                        }} />
                                    </div>
                                    <div style={{ color, fontWeight: 800, fontSize: '18px', width: '28px', textAlign: 'right' }}>
                                        {count}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Emergency alerts box */}
                        <div style={{
                            marginTop:    '20px',
                            background:   `${COLORS.critical}10`,
                            border:       `1px solid ${COLORS.critical}33`,
                            borderRadius: '8px',
                            padding:      '12px 14px',
                            display:      'flex',
                            alignItems:   'center',
                            gap:          '10px',
                        }}>
                            <span style={{ fontSize: '20px' }}>🚨</span>
                            <div>
                                <div style={{ color: COLORS.critical, fontWeight: 700, fontSize: '13px' }}>
                                    {HOSPITAL_DATA.emergency.today} Emergency Cases Today
                                </div>
                                <div style={{ color: COLORS.muted, fontSize: '11px' }}>
                                    {HOSPITAL_DATA.emergency.pending} awaiting triage
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Doctors on duty ────────────────────────────────────── */}
                <div>
                    {sectionTitle('Medical Staff', `${HOSPITAL_DATA.doctors.onDuty} of ${HOSPITAL_DATA.doctors.total} doctors currently on duty`)}
                    <div style={gridStyle('repeat(auto-fit, minmax(220px, 1fr))')}>
                        {DOCTORS.map((doc) => {
                            const onDuty = doc.status === 'on-duty';
                            return (
                                <div key={doc.name} style={{
                                    background:   COLORS.card,
                                    border:       `1px solid ${onDuty ? COLORS.normal + '33' : COLORS.border}`,
                                    borderRadius: '10px',
                                    padding:      '14px 16px',
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          '12px',
                                    opacity:      onDuty ? 1 : 0.5,
                                }}>
                                    <div style={{
                                        width:        '42px', height: '42px',
                                        borderRadius: '50%',
                                        background:   onDuty ? `${COLORS.normal}22` : COLORS.border,
                                        display:      'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize:     '20px', flexShrink: 0,
                                        border:       `2px solid ${onDuty ? COLORS.normal + '55' : 'transparent'}`,
                                    }}>
                                        👨‍⚕️
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: COLORS.text, fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {doc.name}
                                        </div>
                                        <div style={{ color: COLORS.muted, fontSize: '11px' }}>
                                            {doc.speciality}
                                        </div>
                                        {onDuty && (
                                            <div style={{ color: COLORS.normal, fontSize: '11px', fontWeight: 600 }}>
                                                ● {doc.patients} patient{doc.patients !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Recent admissions ──────────────────────────────────── */}
                <div>
                    {sectionTitle('Recent Admissions')}
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{
                            display:             'grid',
                            gridTemplateColumns: '80px 1fr 60px 1fr 100px 90px',
                            padding:             '10px 16px',
                            background:          'rgba(255,255,255,0.03)',
                            borderBottom:        `1px solid ${COLORS.border}`,
                            color:               COLORS.muted,
                            fontSize:            '11px',
                            fontWeight:          700,
                            letterSpacing:       '0.06em',
                            textTransform:       'uppercase',
                            gap:                 '12px',
                        }}>
                            <span>ID</span><span>Name</span><span>Age</span>
                            <span>Condition</span><span>Ward</span><span>Status</span>
                        </div>
                        {/* Table rows */}
                        {RECENT_ADMISSIONS.map((p, i) => {
                            const color = statusColor(p.status);
                            return (
                                <div key={p.id} style={{
                                    display:             'grid',
                                    gridTemplateColumns: '80px 1fr 60px 1fr 100px 90px',
                                    padding:             '12px 16px',
                                    borderBottom:        i < RECENT_ADMISSIONS.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                                    gap:                 '12px',
                                    alignItems:          'center',
                                    transition:          'background 0.2s',
                                }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ color: COLORS.muted, fontSize: '12px', fontFamily: 'monospace' }}>{p.id}</span>
                                    <span style={{ color: COLORS.text, fontWeight: 600, fontSize: '13px' }}>{p.name}</span>
                                    <span style={{ color: COLORS.muted, fontSize: '13px' }}>{p.age}</span>
                                    <span style={{ color: COLORS.muted, fontSize: '13px' }}>{p.condition}</span>
                                    <span style={{
                                        background: COLORS.border, borderRadius: '6px',
                                        padding: '3px 10px', fontSize: '12px', color: COLORS.text,
                                        display: 'inline-block',
                                    }}>{p.ward}</span>
                                    <span style={{
                                        color: color, fontWeight: 700, fontSize: '12px',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        ● {p.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
