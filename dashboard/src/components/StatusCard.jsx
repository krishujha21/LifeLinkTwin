/**
 * LifeLink Twin - Status Card Component
 * 
 * Large glowing badge showing patient's overall status.
 * Changes color dynamically based on vital conditions.
 */

function StatusCard({ status, patientName, patientId, alerts }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'critical':
                return {
                    bg: 'status-critical-bg',
                    glow: 'glow-critical-strong',
                    icon: '🚨',
                    text: 'CRITICAL',
                    subtext: 'Immediate attention required',
                    animation: 'pulse-critical'
                };
            case 'warning':
                return {
                    bg: 'status-warning-bg',
                    glow: 'glow-warning-strong',
                    icon: '⚠️',
                    text: 'WARNING',
                    subtext: 'Monitoring closely',
                    animation: 'pulse-warning'
                };
            default:
                return {
                    bg: 'status-normal-bg',
                    glow: 'glow-normal',
                    icon: '✓',
                    text: 'STABLE',
                    subtext: 'Vitals within normal range',
                    animation: ''
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`card vital-card status-card ${config.glow}`}>
            <div className="card-body text-center">
                {/* Patient Info */}
                <div className="patient-info mb-4">
                    <div className="patient-avatar mb-2">
                        <span className="avatar-icon">👤</span>
                    </div>
                    <h5 className="patient-name mb-1">{patientName || 'Patient'}</h5>
                    <small className="text-muted">{patientId || 'ID: --'}</small>
                </div>

                {/* Status Badge */}
                <div className={`status-badge-large ${config.bg} ${config.animation}`}>
                    <span className="status-icon">{config.icon}</span>
                    <span className="status-text">{config.text}</span>
                </div>

                <p className="status-subtext mt-3 text-muted">
                    {config.subtext}
                </p>

                {/* Active Alerts */}
                {alerts && alerts.length > 0 && (
                    <div className="alerts-preview mt-3">
                        <small className="text-warning">
                            {alerts.length} active alert{alerts.length > 1 ? 's' : ''}
                        </small>
                    </div>
                )}

                {/* Digital Twin Indicator */}
                <div className="digital-twin-badge mt-4">
                    <span className="twin-dot"></span>
                    <small>Digital Twin Active</small>
                </div>
            </div>
        </div>
    );
}

export default StatusCard;
