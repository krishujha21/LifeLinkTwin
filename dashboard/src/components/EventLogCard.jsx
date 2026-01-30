/**
 * LifeLink Twin - System Event Log Card Component
 * 
 * Scrollable list of system events like connection status,
 * server alerts, and critical notifications.
 */

function EventLogCard({ events }) {
    const getEventIcon = (type) => {
        switch (type) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📋';
        }
    };

    const getEventClass = (type) => {
        switch (type) {
            case 'critical': return 'event-critical';
            case 'warning': return 'event-warning';
            default: return 'event-info';
        }
    };

    return (
        <div className="card vital-card event-log-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🖥️</span>
                        <span className="vital-title">System Event Log</span>
                    </div>
                    <span className="badge bg-secondary">{events?.length || 0} events</span>
                </div>

                {/* Events List */}
                <div className="event-list">
                    {events && events.length > 0 ? (
                        events.slice().reverse().map((event, index) => (
                            <div key={index} className={`event-item ${getEventClass(event.type)}`}>
                                <div className="event-icon">
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="event-content">
                                    <div className="event-message">{event.message}</div>
                                    <div className="event-time">{event.time}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-events text-center py-4">
                            <span className="text-muted">No system events recorded</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventLogCard;