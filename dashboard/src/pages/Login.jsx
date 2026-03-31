/**
 * LifeLink Twin — Login Page
 * Route: /
 * Role selector → saves to localStorage → routes to correct dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/riskUtils';

const ROLES = [
    {
        id: 'attendant',
        label: 'Family / Attendant',
        icon: '👨‍👩‍👧‍👦',
        desc: 'Track your loved one\'s vitals in real-time',
        route: '/attendant',
        accent: COLORS.accent,
    },
    {
        id: 'doctor',
        label: 'Medical Doctor',
        icon: '👨‍⚕️',
        desc: 'Full clinical dashboard with AI assessment',
        route: '/doctor',
        accent: COLORS.ai,
    },
    {
        id: 'hospital',
        label: 'Hospital Admin',
        icon: '🏥',
        desc: 'Bed occupancy, resource & patient overview',
        route: '/hospital',
        accent: COLORS.normal,
    },
];

export default function Login() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('attendant');
    const [name, setName]                 = useState('');
    const [patientId, setPatientId]       = useState('patient1');
    const [error, setError]               = useState('');

    const role = ROLES.find(r => r.id === selectedRole);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Please enter your name.'); return; }
        if (!patientId.trim()) { setError('Please enter a patient ID.'); return; }

        localStorage.setItem('ll_role',      selectedRole);
        localStorage.setItem('ll_name',      name.trim());
        localStorage.setItem('ll_patientId', patientId.trim());

        navigate(role.route);
    };

    // ── styles ──────────────────────────────────────────────────────────────
    const pageStyle = {
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08) 0%, ${COLORS.bg} 60%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", sans-serif',
        padding: '20px',
    };

    const cardStyle = {
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    };

    const inputStyle = {
        width: '100%',
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: COLORS.text,
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        marginTop: '6px',
    };

    const labelStyle = {
        color: COLORS.muted,
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    };

    const roleCardStyle = (id) => ({
        border: `2px solid ${selectedRole === id ? role.accent : COLORS.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        cursor: 'pointer',
        background: selectedRole === id ? `rgba(${hexToRgb(role.accent)},0.08)` : 'transparent',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    });

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '42px', marginBottom: '8px' }}>🫀</div>
                    <h1 style={{ color: COLORS.text, fontSize: '24px', fontWeight: 700, margin: 0 }}>
                        LifeLink Twin
                    </h1>
                    <p style={{ color: COLORS.muted, fontSize: '14px', margin: '6px 0 0' }}>
                        Real-time Health Monitoring System
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Role selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ ...labelStyle, marginBottom: '12px' }}>Select Your Role</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {ROLES.map(r => (
                                <div
                                    key={r.id}
                                    style={roleCardStyle(r.id)}
                                    onClick={() => setSelectedRole(r.id)}
                                >
                                    <span style={{ fontSize: '28px', lineHeight: 1 }}>{r.icon}</span>
                                    <div>
                                        <div style={{
                                            color: selectedRole === r.id ? COLORS.text : COLORS.muted,
                                            fontWeight: 600,
                                            fontSize: '15px',
                                        }}>
                                            {r.label}
                                        </div>
                                        <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '2px' }}>
                                            {r.desc}
                                        </div>
                                    </div>
                                    {/* Selection indicator */}
                                    <div style={{ marginLeft: 'auto' }}>
                                        <div style={{
                                            width: '18px', height: '18px',
                                            borderRadius: '50%',
                                            border: `2px solid ${selectedRole === r.id ? r.accent : COLORS.border}`,
                                            background: selectedRole === r.id ? r.accent : 'transparent',
                                            transition: 'all 0.2s',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Name input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            Your Name
                        </label>
                        <input
                            style={inputStyle}
                            type="text"
                            placeholder={selectedRole === 'doctor' ? 'Dr. Sharma' : 'Enter your name'}
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            autoComplete="name"
                        />
                    </div>

                    {/* Patient ID input — hidden for hospital admin */}
                    {selectedRole !== 'hospital' && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>
                                Patient ID
                            </label>
                            <input
                                style={inputStyle}
                                type="text"
                                placeholder="patient1"
                                value={patientId}
                                onChange={e => { setPatientId(e.target.value); setError(''); }}
                            />
                            <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '6px' }}>
                                Default: <code style={{ color: COLORS.accent }}>patient1</code>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: `1px solid ${COLORS.critical}`,
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: COLORS.critical,
                            fontSize: '13px',
                            marginBottom: '16px',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: `linear-gradient(135deg, ${role.accent}, ${role.accent}bb)`,
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            transition: 'opacity 0.2s',
                            boxShadow: `0 4px 20px ${role.accent}44`,
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                        Enter as {role.label.split('/')[0].trim()} →
                    </button>
                </form>

                {/* Footer */}
                <p style={{ color: COLORS.muted, fontSize: '12px', textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
                    🔒 Demo mode · No real authentication · Hackathon build
                </p>
            </div>
        </div>
    );
}

// Helper: convert hex to "r,g,b" string for rgba()
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '59,130,246';
    return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
