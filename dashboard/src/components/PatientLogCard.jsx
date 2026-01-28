/**
 * LifeLink Twin - Patient Log Card Component
 * 
 * Displays patient-specific vital sign changes and health events
 * with timestamps and severity indicators.
 */

function PatientLogCard({ patientLogs }) {
    const getLogIcon = (type) => {
        switch (type) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'normal': return '✅';
            case 'vitals': return '💓';
            case 'spo2': return '🫁';
            case 'temp': return '🌡️';
            default: return '👤';
        }
    };

    const getLogClass = (type) => {
        switch (type) {
            case 'critical': return 'event-critical';
            case 'warning': return 'event-warning';
            case 'normal': return 'event-normal';
            default: return 'event-info';
        }
    };

    return (
        <div className="card vital-card patient-log-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">👤</span>
                        <span className="vital-title">Patient Log</span>
                    </div>
                    <span className="badge bg-primary">{patientLogs?.length || 0} entries</span>
                </div>

                {/* Patient Logs List */}
                <div className="event-list patient-log-list">
                    {patientLogs && patientLogs.length > 0 ? (
                        patientLogs.slice().reverse().map((log, index) => (
                            <div key={index} className={`event-item ${getLogClass(log.severity)}`}>
                                <div className="event-icon">
                                    {getLogIcon(log.type)}
                                </div>
                                <div className="event-content">
                                    <div className="event-message">
                                        {log.vital && (
                                            <span className="badge bg-dark me-2" style={{ fontSize: '0.65rem' }}>
                                                {log.vital}
                                            </span>
                                        )}
                                        {log.message}
                                    </div>
                                    <div className="event-details d-flex gap-2 align-items-center">
                                        <span className="event-time">{log.time}</span>
                                        {log.value && (
                                            <span className={`badge ${log.severity === 'critical' ? 'bg-danger' : log.severity === 'warning' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                {log.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-events text-center py-4">
                            <span style={{ fontSize: '2rem' }}>👤</span>
                            <p className="text-muted mt-2 mb-0">No patient logs yet</p>
                            <small className="text-muted">Start simulator to see patient data</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PatientLogCard;
