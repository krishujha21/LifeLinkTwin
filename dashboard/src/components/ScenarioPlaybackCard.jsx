/**
 * LifeLink Twin - Emergency Scenario Playback Mode
 * 
 * Replay past emergency scenarios for training, analysis,
 * and protocol improvement. Timeline scrubbing with event markers.
 */

import { useState, useEffect, useRef } from 'react';

function ScenarioPlaybackCard({ onPlaybackData }) {
    const [scenarios] = useState([
        {
            id: 1,
            name: 'Cardiac Emergency - Case #2847',
            date: '2026-01-15',
            duration: 1800, // 30 min in seconds
            outcome: 'success',
            events: [
                { time: 0, type: 'start', message: 'Emergency call received', severity: 'info' },
                { time: 120, type: 'dispatch', message: 'Ambulance dispatched', severity: 'info' },
                { time: 300, type: 'arrival', message: 'Arrived at scene', severity: 'info' },
                { time: 360, type: 'vitals', message: 'Initial vitals: HR 142, SpO2 88%', severity: 'warning' },
                { time: 480, type: 'alert', message: 'Critical: Cardiac arrhythmia detected', severity: 'critical' },
                { time: 540, type: 'intervention', message: 'Defibrillation administered', severity: 'warning' },
                { time: 600, type: 'vitals', message: 'Post-defib: HR 98, SpO2 94%', severity: 'info' },
                { time: 900, type: 'transport', message: 'En route to hospital', severity: 'info' },
                { time: 1500, type: 'arrival', message: 'Arrived at ER', severity: 'info' },
                { time: 1800, type: 'handoff', message: 'Patient handed off to ER team', severity: 'success' }
            ],
            vitalsTimeline: []
        },
        {
            id: 2,
            name: 'Respiratory Distress - Case #2891',
            date: '2026-01-20',
            duration: 2400,
            outcome: 'success',
            events: [
                { time: 0, type: 'start', message: 'Emergency call received', severity: 'info' },
                { time: 180, type: 'dispatch', message: 'Ambulance dispatched', severity: 'info' },
                { time: 420, type: 'arrival', message: 'Arrived at scene', severity: 'info' },
                { time: 480, type: 'vitals', message: 'Initial vitals: HR 110, SpO2 82%', severity: 'critical' },
                { time: 540, type: 'intervention', message: 'Oxygen therapy started', severity: 'warning' },
                { time: 720, type: 'vitals', message: 'SpO2 improving: 89%', severity: 'warning' },
                { time: 1200, type: 'transport', message: 'En route to hospital', severity: 'info' },
                { time: 2100, type: 'arrival', message: 'Arrived at ER', severity: 'info' },
                { time: 2400, type: 'handoff', message: 'Stable handoff completed', severity: 'success' }
            ]
        },
        {
            id: 3,
            name: 'Trauma Case - Case #2903',
            date: '2026-01-25',
            duration: 1500,
            outcome: 'critical',
            events: [
                { time: 0, type: 'start', message: 'MVA reported', severity: 'critical' },
                { time: 90, type: 'dispatch', message: 'Multiple units dispatched', severity: 'warning' },
                { time: 300, type: 'arrival', message: 'First responder on scene', severity: 'info' },
                { time: 360, type: 'vitals', message: 'Critical: HR 160, SpO2 78%, BP 80/50', severity: 'critical' },
                { time: 420, type: 'intervention', message: 'IV access established, fluids started', severity: 'warning' },
                { time: 600, type: 'alert', message: 'Hemorrhagic shock suspected', severity: 'critical' },
                { time: 900, type: 'transport', message: 'Rapid transport initiated', severity: 'critical' },
                { time: 1500, type: 'arrival', message: 'Arrived at trauma center', severity: 'info' }
            ]
        }
    ]);

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(10); // 10x speed
    const playbackRef = useRef(null);

    // Generate vitals for timeline
    const generateVitalsAtTime = (scenario, time) => {
        const progress = time / scenario.duration;
        let hr, spo2, temp;

        if (scenario.outcome === 'success') {
            // Improving trend
            hr = 140 - progress * 50 + Math.random() * 10;
            spo2 = 85 + progress * 12 + Math.random() * 3;
            temp = 38.5 - progress * 1;
        } else {
            // Critical trend
            hr = 100 + progress * 60 + Math.random() * 15;
            spo2 = 95 - progress * 20 + Math.random() * 5;
            temp = 36.5 + progress * 2;
        }

        return {
            heartRate: Math.round(Math.max(50, Math.min(180, hr))),
            spo2: Math.round(Math.max(70, Math.min(100, spo2))),
            temperature: Math.max(35, Math.min(41, temp)).toFixed(1)
        };
    };

    // Playback control
    useEffect(() => {
        if (isPlaying && selectedScenario) {
            playbackRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const newTime = prev + playbackSpeed;
                    if (newTime >= selectedScenario.duration) {
                        setIsPlaying(false);
                        return selectedScenario.duration;
                    }

                    // Send vitals to parent if callback exists
                    if (onPlaybackData) {
                        const vitals = generateVitalsAtTime(selectedScenario, newTime);
                        onPlaybackData({
                            vitals,
                            time: newTime,
                            scenario: selectedScenario.name
                        });
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (playbackRef.current) {
                clearInterval(playbackRef.current);
            }
        };
    }, [isPlaying, selectedScenario, playbackSpeed, onPlaybackData]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCurrentEvents = () => {
        if (!selectedScenario) return [];
        return selectedScenario.events.filter(e => e.time <= currentTime);
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'start': return '🚨';
            case 'dispatch': return '🚑';
            case 'arrival': return '📍';
            case 'vitals': return '💓';
            case 'alert': return '⚠️';
            case 'intervention': return '💉';
            case 'transport': return '🚗';
            case 'handoff': return '🏥';
            default: return '📋';
        }
    };

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'critical': return 'text-danger';
            case 'warning': return 'text-warning';
            case 'success': return 'text-success';
            default: return 'text-info';
        }
    };

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🎬</span>
                        <span className="vital-title">Scenario Playback</span>
                    </div>
                    <span className="badge bg-purple">Training Mode</span>
                </div>

                {/* Scenario Selection */}
                {!selectedScenario ? (
                    <div className="scenario-list">
                        <small className="text-muted d-block mb-2">Select a scenario to replay:</small>
                        {scenarios.map(scenario => (
                            <div
                                key={scenario.id}
                                className="scenario-item p-2 bg-dark rounded mb-2 cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setSelectedScenario(scenario);
                                    setCurrentTime(0);
                                    setIsPlaying(false);
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold small">{scenario.name}</div>
                                        <small className="text-muted">{scenario.date} • {formatTime(scenario.duration)}</small>
                                    </div>
                                    <span className={`badge ${scenario.outcome === 'success' ? 'bg-success' : 'bg-danger'}`}>
                                        {scenario.outcome}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Playback Controls */}
                        <div className="playback-header mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setSelectedScenario(null);
                                        setIsPlaying(false);
                                        setCurrentTime(0);
                                    }}
                                >
                                    ← Back
                                </button>
                                <span className={`badge ${selectedScenario.outcome === 'success' ? 'bg-success' : 'bg-danger'}`}>
                                    {selectedScenario.outcome.toUpperCase()}
                                </span>
                            </div>
                            <div className="small fw-bold">{selectedScenario.name}</div>
                        </div>

                        {/* Timeline Progress */}
                        <div className="timeline-progress mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">{formatTime(currentTime)}</small>
                                <small className="text-muted">{formatTime(selectedScenario.duration)}</small>
                            </div>
                            <div className="progress position-relative" style={{ height: '20px' }}>
                                <div
                                    className="progress-bar bg-info"
                                    style={{ width: `${(currentTime / selectedScenario.duration) * 100}%` }}
                                />
                                {/* Event markers */}
                                {selectedScenario.events.map((event, idx) => (
                                    <div
                                        key={idx}
                                        className="position-absolute"
                                        style={{
                                            left: `${(event.time / selectedScenario.duration) * 100}%`,
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: event.severity === 'critical' ? '#ef4444' :
                                                event.severity === 'warning' ? '#f59e0b' : '#10b981',
                                            zIndex: 1
                                        }}
                                        title={event.message}
                                    />
                                ))}
                            </div>
                            <input
                                type="range"
                                className="form-range mt-2"
                                min="0"
                                max={selectedScenario.duration}
                                value={currentTime}
                                onChange={(e) => setCurrentTime(Number(e.target.value))}
                            />
                        </div>

                        {/* Playback Controls */}
                        <div className="controls d-flex justify-content-center gap-2 mb-3">
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setCurrentTime(0)}
                            >
                                ⏮️
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setCurrentTime(Math.max(0, currentTime - 60))}
                            >
                                ⏪
                            </button>
                            <button
                                className={`btn btn-sm ${isPlaying ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setCurrentTime(Math.min(selectedScenario.duration, currentTime + 60))}
                            >
                                ⏩
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setCurrentTime(selectedScenario.duration)}
                            >
                                ⏭️
                            </button>
                        </div>

                        {/* Speed Control */}
                        <div className="speed-control d-flex align-items-center justify-content-center gap-2 mb-3">
                            <small className="text-muted">Speed:</small>
                            {[1, 5, 10, 30].map(speed => (
                                <button
                                    key={speed}
                                    className={`btn btn-sm ${playbackSpeed === speed ? 'btn-info' : 'btn-outline-secondary'}`}
                                    onClick={() => setPlaybackSpeed(speed)}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        {/* Current Vitals */}
                        {selectedScenario && (
                            <div className="current-vitals mb-3 p-2 bg-dark rounded">
                                <small className="text-muted d-block mb-1">Current Vitals:</small>
                                <div className="d-flex justify-content-around">
                                    {(() => {
                                        const vitals = generateVitalsAtTime(selectedScenario, currentTime);
                                        return (
                                            <>
                                                <span className="text-danger">❤️ {vitals.heartRate}</span>
                                                <span className="text-info">🫁 {vitals.spo2}%</span>
                                                <span className="text-warning">🌡️ {vitals.temperature}°C</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Event Log */}
                        <div className="event-log" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <small className="text-muted d-block mb-2">Event Timeline:</small>
                            {getCurrentEvents().slice().reverse().map((event, idx) => (
                                <div key={idx} className={`event-item d-flex align-items-start py-1 ${getSeverityClass(event.severity)}`}>
                                    <span className="me-2">{getEventIcon(event.type)}</span>
                                    <div className="flex-grow-1">
                                        <small>{event.message}</small>
                                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                            T+{formatTime(event.time)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ScenarioPlaybackCard;
