/**
 * LifeLink Twin - Network Stats Card Component
 * 
 * Displays connection statistics including latency,
 * packet rate, and connection status.
 */

function NetworkStatsCard({ connected, latency, packetRate, lastUpdate }) {
    return (
        <div className="card vital-card network-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">📡</span>
                        <span className="vital-title">Network Stats</span>
                    </div>
                    <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                        {connected ? 'Online' : 'Offline'}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="network-stats-grid">
                    {/* Connection Status */}
                    <div className="stat-item">
                        <div className="stat-label">Connection</div>
                        <div className={`stat-value ${connected ? 'text-success' : 'text-danger'}`}>
                            <span className={`status-indicator ${connected ? 'online' : 'offline'}`}></span>
                            {connected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>

                    {/* Latency */}
                    <div className="stat-item">
                        <div className="stat-label">Latency</div>
                        <div className="stat-value">
                            <span className={latency < 50 ? 'text-success' : latency < 100 ? 'text-warning' : 'text-danger'}>
                                {latency || '--'}
                            </span>
                            <small className="text-muted"> ms</small>
                        </div>
                    </div>

                    {/* Packet Rate */}
                    <div className="stat-item">
                        <div className="stat-label">Packet Rate</div>
                        <div className="stat-value">
                            <span className="text-info">{packetRate || 1}</span>
                            <small className="text-muted"> /sec</small>
                        </div>
                    </div>

                    {/* Last Update */}
                    <div className="stat-item">
                        <div className="stat-label">Last Update</div>
                        <div className="stat-value text-muted">
                            {lastUpdate || '--:--:--'}
                        </div>
                    </div>
                </div>

                {/* Connection Quality Bar */}
                <div className="connection-quality mt-3">
                    <small className="text-muted">Signal Quality</small>
                    <div className="quality-bars d-flex gap-1 mt-1">
                        <div className={`quality-bar ${connected ? 'active' : ''}`}></div>
                        <div className={`quality-bar ${connected && latency < 100 ? 'active' : ''}`}></div>
                        <div className={`quality-bar ${connected && latency < 50 ? 'active' : ''}`}></div>
                        <div className={`quality-bar ${connected && latency < 30 ? 'active' : ''}`}></div>
                        <div className={`quality-bar ${connected && latency < 20 ? 'active' : ''}`}></div>
                    </div>
                </div>

                {/* MQTT Topic */}
                <div className="mqtt-info mt-3 p-2 rounded" style={{ backgroundColor: '#1a1f2e' }}>
                    <small className="text-muted">MQTT Topic:</small>
                    <code className="d-block text-info small">lifelink/patient1/processed</code>
                </div>
            </div>
        </div>
    );
}

export default NetworkStatsCard;
