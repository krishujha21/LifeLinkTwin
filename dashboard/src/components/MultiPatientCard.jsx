/**
 * LifeLink Twin - Multi-Patient Overview Card
 * 
 * Shows all connected ambulances/patients at a glance
 * with real-time status, vitals summary, and quick switching.
 */

function MultiPatientCard({
    patients,
    allPatientsData,
    selectedPatientId,
    onSelectPatient
}) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#10b981';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'critical': return 'rgba(239, 68, 68, 0.15)';
            case 'warning': return 'rgba(245, 158, 11, 0.15)';
            default: return 'rgba(16, 185, 129, 0.15)';
        }
    };

    const getConditionIcon = (condition) => {
        switch (condition) {
            case 'Cardiac': return '❤️';
            case 'Trauma': return '🩹';
            case 'Respiratory': return '🫁';
            case 'Stroke': return '🧠';
            default: return '🏥';
        }
    };

    // Count patients by status
    const statusCounts = patients.reduce((acc, patient) => {
        const data = allPatientsData[patient.id];
        const status = data?.status || 'normal';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🚑</span>
                        <span className="vital-title">Active Ambulances</span>
                    </div>
                    <div className="d-flex gap-2">
                        {statusCounts.critical > 0 && (
                            <span className="badge bg-danger">{statusCounts.critical} Critical</span>
                        )}
                        {statusCounts.warning > 0 && (
                            <span className="badge bg-warning text-dark">{statusCounts.warning} Warning</span>
                        )}
                        <span className="badge bg-success">{statusCounts.normal || 0} Stable</span>
                    </div>
                </div>

                {/* Patients Grid */}
                <div className="patients-grid">
                    {patients.map(patient => {
                        const data = allPatientsData[patient.id];
                        const isSelected = patient.id === selectedPatientId;
                        const status = data?.status || 'normal';
                        const vitals = data?.vitals || {};

                        return (
                            <div
                                key={patient.id}
                                className={`patient-card p-3 rounded mb-2 ${isSelected ? 'selected' : ''}`}
                                onClick={() => onSelectPatient(patient.id)}
                                style={{
                                    backgroundColor: isSelected ? getStatusBg(status) : 'var(--bg-input, #1e2430)',
                                    border: isSelected ? `2px solid ${getStatusColor(status)}` : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    {/* Patient Info */}
                                    <div className="patient-info">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <span style={{ fontSize: '1.2rem' }}>{getConditionIcon(patient.condition)}</span>
                                            <span className="fw-bold">{patient.name}</span>
                                            {isSelected && <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>VIEWING</span>}
                                        </div>
                                        <div className="small text-muted">
                                            <span className="me-2">🚑 {patient.ambulance}</span>
                                            <span>📍 {patient.location}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="badge" style={{
                                                backgroundColor: getStatusBg(status),
                                                color: getStatusColor(status),
                                                fontSize: '0.65rem'
                                            }}>
                                                {patient.condition}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    <div
                                        className="status-pulse"
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor(status),
                                            boxShadow: status === 'critical' ? `0 0 10px ${getStatusColor(status)}` : 'none',
                                            animation: status === 'critical' ? 'pulse 1s infinite' : 'none'
                                        }}
                                    />
                                </div>

                                {/* Vitals Summary */}
                                {data && (
                                    <div className="vitals-summary mt-2 pt-2 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
                                        <div className="d-flex justify-content-between">
                                            <div className="vital-mini text-center">
                                                <span className="d-block" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HR</span>
                                                <span className="fw-bold" style={{
                                                    color: vitals.heartRate > 120 ? '#ef4444' : vitals.heartRate > 100 ? '#f59e0b' : '#10b981',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {vitals.heartRate || '--'}
                                                </span>
                                            </div>
                                            <div className="vital-mini text-center">
                                                <span className="d-block" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SpO2</span>
                                                <span className="fw-bold" style={{
                                                    color: vitals.spo2 < 90 ? '#ef4444' : vitals.spo2 < 95 ? '#f59e0b' : '#10b981',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {vitals.spo2 || '--'}%
                                                </span>
                                            </div>
                                            <div className="vital-mini text-center">
                                                <span className="d-block" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temp</span>
                                                <span className="fw-bold" style={{
                                                    color: vitals.temperature > 38.5 ? '#ef4444' : vitals.temperature > 37.5 ? '#f59e0b' : '#10b981',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {vitals.temperature?.toFixed(1) || '--'}°
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Network Stats */}
                <div className="network-summary mt-3 p-2 bg-dark rounded">
                    <div className="d-flex justify-content-around text-center">
                        <div>
                            <small className="text-muted d-block">Total Nodes</small>
                            <span className="fw-bold text-info">{patients.length}</span>
                        </div>
                        <div>
                            <small className="text-muted d-block">Data Streams</small>
                            <span className="fw-bold text-success">{patients.length * 3}</span>
                        </div>
                        <div>
                            <small className="text-muted d-block">IoT Network</small>
                            <span className="fw-bold text-primary">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                .patient-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}

export default MultiPatientCard;