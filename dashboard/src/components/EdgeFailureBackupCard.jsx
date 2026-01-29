/**
 * LifeLink Twin - Edge Failure Backup Mode
 * 
 * Simulates and handles edge device failures with:
 * - Automatic failover to cloud processing
 * - Local data caching during connectivity loss
 * - Recovery and sync mechanisms
 * - Redundancy status monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';

function EdgeFailureBackupCard({ connected }) {
    const [systemState, setSystemState] = useState({
        edgeStatus: 'online', // online, degraded, offline
        cloudStatus: 'online',
        backupMode: 'normal', // normal, failover, recovery
        cachedDataPoints: 0,
        lastSync: new Date(),
        failoverHistory: [],
        redundancy: {
            primaryEdge: { status: 'healthy', location: 'Ambulance Edge Unit', latency: 12 },
            backupEdge: { status: 'standby', location: 'Regional Edge Server', latency: 45 },
            cloudBackup: { status: 'available', location: 'Azure Cloud - Mumbai', latency: 85 }
        },
        networkHealth: {
            packetLoss: 0,
            jitter: 5,
            bandwidth: 25 // Mbps
        }
    });

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationScenario, setSimulationScenario] = useState(null);
    const simulationRef = useRef(null);

    // Simulate edge failure scenarios
    const failureScenarios = [
        {
            id: 'network_loss',
            name: 'Network Connectivity Loss',
            icon: '📡',
            description: 'Simulates complete network failure - edge goes offline',
            duration: 10000,
            effects: { edgeStatus: 'offline', backupMode: 'failover', packetLoss: 100 }
        },
        {
            id: 'degraded_network',
            name: 'Degraded Network',
            icon: '🔻',
            description: 'High latency and packet loss scenario',
            duration: 15000,
            effects: { edgeStatus: 'degraded', backupMode: 'normal', packetLoss: 35, jitter: 120 }
        },
        {
            id: 'edge_crash',
            name: 'Edge Device Crash',
            icon: '💥',
            description: 'Edge device becomes unresponsive',
            duration: 12000,
            effects: { edgeStatus: 'offline', backupMode: 'failover' }
        },
        {
            id: 'cloud_unreachable',
            name: 'Cloud Unreachable',
            icon: '☁️',
            description: 'Cloud backend becomes unreachable',
            duration: 8000,
            effects: { cloudStatus: 'offline', backupMode: 'edge-only' }
        }
    ];

    // Start failure simulation
    const startSimulation = useCallback((scenario) => {
        if (isSimulating) return;

        setIsSimulating(true);
        setSimulationScenario(scenario);

        // Apply failure effects
        setSystemState(prev => ({
            ...prev,
            edgeStatus: scenario.effects.edgeStatus || prev.edgeStatus,
            cloudStatus: scenario.effects.cloudStatus || prev.cloudStatus,
            backupMode: scenario.effects.backupMode || 'failover',
            networkHealth: {
                ...prev.networkHealth,
                packetLoss: scenario.effects.packetLoss || 0,
                jitter: scenario.effects.jitter || prev.networkHealth.jitter
            },
            failoverHistory: [
                ...prev.failoverHistory.slice(-4),
                {
                    time: new Date().toLocaleTimeString(),
                    scenario: scenario.name,
                    action: 'Failover initiated'
                }
            ],
            redundancy: {
                ...prev.redundancy,
                primaryEdge: {
                    ...prev.redundancy.primaryEdge,
                    status: scenario.effects.edgeStatus === 'offline' ? 'failed' :
                        scenario.effects.edgeStatus === 'degraded' ? 'degraded' : 'healthy'
                },
                backupEdge: {
                    ...prev.redundancy.backupEdge,
                    status: scenario.effects.edgeStatus === 'offline' ? 'active' : 'standby'
                }
            }
        }));

        // Simulate data caching during failure
        const cachingInterval = setInterval(() => {
            if (scenario.effects.edgeStatus === 'offline' || scenario.effects.cloudStatus === 'offline') {
                setSystemState(prev => ({
                    ...prev,
                    cachedDataPoints: prev.cachedDataPoints + Math.floor(Math.random() * 3) + 1
                }));
            }
        }, 1000);

        // Auto-recover after duration
        simulationRef.current = setTimeout(() => {
            clearInterval(cachingInterval);
            handleRecovery();
        }, scenario.duration);

    }, [isSimulating]);

    // Handle recovery process
    const handleRecovery = useCallback(() => {
        // Start recovery phase
        setSystemState(prev => ({
            ...prev,
            backupMode: 'recovery'
        }));

        // Simulate sync process
        const syncInterval = setInterval(() => {
            setSystemState(prev => {
                const newCached = Math.max(0, prev.cachedDataPoints - 5);
                if (newCached === 0) {
                    clearInterval(syncInterval);
                    // Full recovery
                    return {
                        ...prev,
                        edgeStatus: 'online',
                        cloudStatus: 'online',
                        backupMode: 'normal',
                        cachedDataPoints: 0,
                        lastSync: new Date(),
                        networkHealth: {
                            packetLoss: 0,
                            jitter: 5,
                            bandwidth: 25
                        },
                        redundancy: {
                            primaryEdge: { status: 'healthy', location: 'Ambulance Edge Unit', latency: 12 },
                            backupEdge: { status: 'standby', location: 'Regional Edge Server', latency: 45 },
                            cloudBackup: { status: 'available', location: 'Azure Cloud - Mumbai', latency: 85 }
                        },
                        failoverHistory: [
                            ...prev.failoverHistory.slice(-4),
                            {
                                time: new Date().toLocaleTimeString(),
                                scenario: 'Recovery',
                                action: 'All systems restored'
                            }
                        ]
                    };
                }
                return { ...prev, cachedDataPoints: newCached };
            });
        }, 500);

        setIsSimulating(false);
        setSimulationScenario(null);
    }, []);

    // Stop simulation manually
    const stopSimulation = useCallback(() => {
        if (simulationRef.current) {
            clearTimeout(simulationRef.current);
        }
        handleRecovery();
    }, [handleRecovery]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (simulationRef.current) {
                clearTimeout(simulationRef.current);
            }
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
            case 'healthy':
            case 'available': return '#10b981';
            case 'degraded':
            case 'active': return '#f59e0b';
            case 'offline':
            case 'failed': return '#ef4444';
            case 'standby': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getModeColor = (mode) => {
        switch (mode) {
            case 'normal': return 'success';
            case 'failover': return 'danger';
            case 'recovery': return 'warning';
            case 'edge-only': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <div className="card vital-card" style={{
            borderColor: systemState.backupMode !== 'normal' ? '#ef4444' : undefined,
            borderWidth: systemState.backupMode !== 'normal' ? '2px' : undefined
        }}>
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🛡️</span>
                        <span className="vital-title">Edge Failure Backup</span>
                    </div>
                    <span className={`badge bg-${getModeColor(systemState.backupMode)}`}>
                        {systemState.backupMode.toUpperCase()}
                    </span>
                </div>

                {/* System Status Overview */}
                <div className="status-overview mb-3">
                    <div className="row g-2">
                        {/* Edge Status */}
                        <div className="col-6">
                            <div className="p-2 bg-dark rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>🚑 Edge</span>
                                    <span
                                        className="status-indicator"
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor(systemState.edgeStatus),
                                            animation: systemState.edgeStatus === 'online' ? 'pulse 2s infinite' : 'none'
                                        }}
                                    />
                                </div>
                                <small className="text-muted text-capitalize">{systemState.edgeStatus}</small>
                            </div>
                        </div>

                        {/* Cloud Status */}
                        <div className="col-6">
                            <div className="p-2 bg-dark rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>☁️ Cloud</span>
                                    <span
                                        className="status-indicator"
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor(systemState.cloudStatus)
                                        }}
                                    />
                                </div>
                                <small className="text-muted text-capitalize">{systemState.cloudStatus}</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redundancy Status */}
                <div className="redundancy-section mb-3">
                    <small className="text-muted d-block mb-2">Redundancy Layers:</small>
                    {Object.entries(systemState.redundancy).map(([key, node]) => (
                        <div key={key} className="d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-1">
                            <div className="d-flex align-items-center">
                                <span
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: getStatusColor(node.status),
                                        marginRight: '8px'
                                    }}
                                />
                                <span className="small">{node.location}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-secondary">{node.latency}ms</span>
                                <span className="badge" style={{ backgroundColor: getStatusColor(node.status), fontSize: '0.7rem' }}>
                                    {node.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Network Health */}
                <div className="network-health mb-3 p-2 bg-dark rounded">
                    <small className="text-muted d-block mb-2">Network Health:</small>
                    <div className="row g-2">
                        <div className="col-4 text-center">
                            <div className={`small ${systemState.networkHealth.packetLoss > 20 ? 'text-danger' : 'text-success'}`}>
                                {systemState.networkHealth.packetLoss}%
                            </div>
                            <small className="text-muted">Packet Loss</small>
                        </div>
                        <div className="col-4 text-center">
                            <div className={`small ${systemState.networkHealth.jitter > 50 ? 'text-warning' : 'text-success'}`}>
                                {systemState.networkHealth.jitter}ms
                            </div>
                            <small className="text-muted">Jitter</small>
                        </div>
                        <div className="col-4 text-center">
                            <div className="small text-info">
                                {systemState.networkHealth.bandwidth} Mbps
                            </div>
                            <small className="text-muted">Bandwidth</small>
                        </div>
                    </div>
                </div>

                {/* Cached Data Alert */}
                {systemState.cachedDataPoints > 0 && (
                    <div className="cache-alert p-2 mb-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>💾 Cached Data Points</span>
                            <strong className="text-danger">{systemState.cachedDataPoints}</strong>
                        </div>
                        <small className="text-muted">
                            {systemState.backupMode === 'recovery' ? 'Syncing...' : 'Waiting for connection to sync'}
                        </small>
                        {systemState.backupMode === 'recovery' && (
                            <div className="progress mt-2" style={{ height: '4px' }}>
                                <div
                                    className="progress-bar bg-warning"
                                    style={{
                                        width: `${Math.max(0, 100 - systemState.cachedDataPoints * 2)}%`,
                                        animation: 'progressAnim 0.5s infinite'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Failure History */}
                {systemState.failoverHistory.length > 0 && (
                    <div className="history-section mb-3">
                        <small className="text-muted d-block mb-2">Recent Events:</small>
                        <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                            {systemState.failoverHistory.slice(-3).reverse().map((event, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center mb-1 small">
                                    <span className="text-muted">{event.time}</span>
                                    <span>{event.scenario}</span>
                                    <span className="badge bg-secondary">{event.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Simulation Controls */}
                <div className="simulation-controls">
                    <small className="text-muted d-block mb-2">Test Failure Scenarios:</small>
                    <div className="d-flex flex-wrap gap-2">
                        {failureScenarios.map(scenario => (
                            <button
                                key={scenario.id}
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => startSimulation(scenario)}
                                disabled={isSimulating}
                                title={scenario.description}
                            >
                                {scenario.icon} {scenario.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    {isSimulating && (
                        <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-warning">
                                    🔄 Simulating: {simulationScenario?.name}
                                </small>
                                <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={stopSimulation}
                                >
                                    🔧 Force Recovery
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Last Sync */}
                <div className="text-center mt-3">
                    <small className="text-muted">
                        Last Sync: {systemState.lastSync.toLocaleTimeString()}
                    </small>
                </div>
            </div>
        </div>
    );
}

export default EdgeFailureBackupCard;
