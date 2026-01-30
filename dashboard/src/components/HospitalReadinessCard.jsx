/**
 * LifeLink Twin - Hospital Readiness Automation Panel
 * 
 * Shows hospital preparation status for incoming emergency patient,
 * including ER room, staff, equipment, and blood bank readiness.
 */

import { useState, useEffect } from 'react';

function HospitalReadinessCard({ patientData, eta }) {
    const [readiness, setReadiness] = useState({
        overallScore: 0,
        erRoom: { status: 'preparing', room: 'ER-3', eta: '2 min' },
        medicalTeam: { status: 'alerted', members: 4, specialty: 'Cardiology' },
        equipment: { status: 'ready', items: [] },
        bloodBank: { status: 'checking', type: 'O+', units: 0 },
        pharmacy: { status: 'preparing', medications: [] },
        notifications: []
    });

    // Simulate hospital preparation based on patient status
    useEffect(() => {
        const status = patientData?.status || 'normal';
        const isCritical = status === 'critical';
        const isWarning = status === 'warning';

        // Simulate preparation progress
        const interval = setInterval(() => {
            setReadiness(prev => {
                // Progress each department
                const erStatus = Math.random() > 0.3 ? 'ready' : 'preparing';
                const teamStatus = Math.random() > 0.2 ? 'assembled' : 'alerted';
                const equipStatus = 'ready';
                const bloodStatus = Math.random() > 0.4 ? 'available' : 'checking';
                const pharmaStatus = Math.random() > 0.3 ? 'ready' : 'preparing';

                // Calculate overall readiness
                let score = 0;
                if (erStatus === 'ready') score += 25;
                if (teamStatus === 'assembled') score += 25;
                if (equipStatus === 'ready') score += 20;
                if (bloodStatus === 'available') score += 15;
                if (pharmaStatus === 'ready') score += 15;

                // Generate equipment list based on patient condition
                const equipmentList = [
                    { name: 'Defibrillator', ready: true },
                    { name: 'Ventilator', ready: isCritical },
                    { name: 'ECG Monitor', ready: true },
                    { name: 'IV Setup', ready: true },
                    { name: 'Crash Cart', ready: isCritical || isWarning }
                ].filter(e => e.ready);

                // Generate medication list
                const medications = [
                    { name: 'Epinephrine', status: 'ready' },
                    { name: 'Atropine', status: isCritical ? 'ready' : 'standby' },
                    { name: 'Normal Saline', status: 'ready' },
                    { name: 'Morphine', status: isWarning || isCritical ? 'ready' : 'standby' }
                ];

                // Generate notifications
                const newNotifications = [
                    { time: new Date().toLocaleTimeString(), message: `ER-3 ${erStatus}`, type: erStatus === 'ready' ? 'success' : 'info' },
                    ...(teamStatus === 'assembled' ? [{ time: new Date().toLocaleTimeString(), message: 'Medical team assembled', type: 'success' }] : [])
                ];

                return {
                    overallScore: score,
                    erRoom: { status: erStatus, room: 'ER-3', eta: erStatus === 'ready' ? 'Ready' : '1 min' },
                    medicalTeam: {
                        status: teamStatus,
                        members: isCritical ? 6 : 4,
                        specialty: isCritical ? 'Trauma & Cardiology' : 'Emergency'
                    },
                    equipment: { status: equipStatus, items: equipmentList },
                    bloodBank: {
                        status: bloodStatus,
                        type: 'O+',
                        units: bloodStatus === 'available' ? (isCritical ? 4 : 2) : 0
                    },
                    pharmacy: { status: pharmaStatus, medications },
                    notifications: [...prev.notifications.slice(-4), ...newNotifications].slice(-5)
                };
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [patientData]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ready':
            case 'assembled':
            case 'available':
                return '✅';
            case 'preparing':
            case 'alerted':
            case 'checking':
                return '⏳';
            default:
                return '❌';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ready':
            case 'assembled':
            case 'available':
                return 'success';
            case 'preparing':
            case 'alerted':
            case 'checking':
                return 'warning';
            default:
                return 'danger';
        }
    };

    // Accept hospitalMsg from parent (Dashboard) via prop if available
    // For now, try to read from window if set by PredictiveHealthCard (simple demo, not production)
    const [triggerMsg, setTriggerMsg] = useState("");
    useEffect(() => {
        const handleTrigger = (e) => {
            setTriggerMsg(e.detail);
        };
        window.addEventListener('hospitalTrigger', handleTrigger);
        // Also check initial value
        if (window && window._hospitalTriggerMsg) {
            setTriggerMsg(window._hospitalTriggerMsg);
        }
        return () => window.removeEventListener('hospitalTrigger', handleTrigger);
    }, []);

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🏥</span>
                        <span className="vital-title">Hospital Readiness</span>
                    </div>
                    <span className={`badge ${readiness.overallScore >= 80 ? 'bg-success' : 'bg-warning'}`}>
                        {readiness.overallScore}% Ready
                    </span>
                </div>

                {/* Overall Progress */}
                <div className="mb-3">
                    <div className="progress" style={{ height: '8px' }}>
                        <div
                            className={`progress-bar ${readiness.overallScore >= 80 ? 'bg-success' : 'bg-warning'}`}
                            style={{ width: `${readiness.overallScore}%`, transition: 'width 0.5s' }}
                        />
                    </div>
                </div>

                {/* Trigger Message from Predictive Health (show only if not empty) */}
                {triggerMsg && (
                    <div className="alert alert-warning text-center mb-3">
                        {triggerMsg}
                    </div>
                )}

                {/* Department Status Grid */}
                <div className="department-grid">
                    {/* ER Room */}
                    <div className="dept-item d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2">
                        <div>
                            <span className="me-2">🚪</span>
                            <span className="small">ER Room</span>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusColor(readiness.erRoom.status)} me-1`}>
                                {readiness.erRoom.room}
                            </span>
                            <span className="small text-muted">{getStatusIcon(readiness.erRoom.status)}</span>
                        </div>
                    </div>

                    {/* Medical Team */}
                    <div className="dept-item d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2">
                        <div>
                            <span className="me-2">👨‍⚕️</span>
                            <span className="small">Medical Team</span>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusColor(readiness.medicalTeam.status)} me-1`}>
                                {readiness.medicalTeam.members} members
                            </span>
                            <span className="small text-muted">{getStatusIcon(readiness.medicalTeam.status)}</span>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="dept-item d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2">
                        <div>
                            <span className="me-2">🔧</span>
                            <span className="small">Equipment</span>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusColor(readiness.equipment.status)} me-1`}>
                                {readiness.equipment.items.length} items
                            </span>
                            <span className="small text-muted">{getStatusIcon(readiness.equipment.status)}</span>
                        </div>
                    </div>

                    {/* Blood Bank */}
                    <div className="dept-item d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2">
                        <div>
                            <span className="me-2">🩸</span>
                            <span className="small">Blood Bank</span>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusColor(readiness.bloodBank.status)} me-1`}>
                                {readiness.bloodBank.type} ({readiness.bloodBank.units} units)
                            </span>
                            <span className="small text-muted">{getStatusIcon(readiness.bloodBank.status)}</span>
                        </div>
                    </div>

                    {/* Pharmacy */}
                    <div className="dept-item d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2">
                        <div>
                            <span className="me-2">💊</span>
                            <span className="small">Pharmacy</span>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusColor(readiness.pharmacy.status)} me-1`}>
                                {readiness.pharmacy.medications.filter(m => m.status === 'ready').length} ready
                            </span>
                            <span className="small text-muted">{getStatusIcon(readiness.pharmacy.status)}</span>
                        </div>
                    </div>
                </div>

                {/* Team Specialty */}
                <div className="team-info mt-3 p-2 bg-dark rounded">
                    <small className="text-muted">Assigned Specialty:</small>
                    <div className="fw-bold text-info">{readiness.medicalTeam.specialty}</div>
                </div>

                {/* Equipment List */}
                {readiness.equipment.items.length > 0 && (
                    <div className="equipment-list mt-2">
                        <small className="text-muted">Equipment Ready:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {readiness.equipment.items.map((item, idx) => (
                                <span key={idx} className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HospitalReadinessCard;
