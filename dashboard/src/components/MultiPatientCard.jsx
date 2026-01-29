/**
 * LifeLink Twin - Multi-Patient Overview Card
 * 
 * Shows all connected ambulances/patients with dropdown selection
 * and detailed view for the selected patient.
 * Optimized for dark and light mode.
 */

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n';

function MultiPatientCard({
    patients,
    allPatientsData,
    selectedPatientId,
    onSelectPatient
}) {
    const { t } = useLanguage();

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'var(--status-critical, #ef4444)';
            case 'warning': return 'var(--status-warning, #f59e0b)';
            default: return 'var(--status-normal, #10b981)';
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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'critical': return `🔴 ${t('critical')}`;
            case 'warning': return `🟡 ${t('warning')}`;
            default: return `🟢 ${t('stable')}`;
        }
    };

    // Count patients by status
    const statusCounts = patients.reduce((acc, patient) => {
        const data = allPatientsData[patient.id];
        const status = data?.status || 'normal';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Get selected patient details
    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const selectedData = allPatientsData[selectedPatientId];
    const selectedStatus = selectedData?.status || 'normal';
    const selectedVitals = selectedData?.vitals || {};

    return (
        <div className="card vital-card" style={{ overflow: 'visible' }}>
            <div className="card-body" style={{ overflow: 'visible' }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🚑</span>
                        <span className="vital-title">{t('livePatientMonitor')}</span>
                    </div>
                    <div className="d-flex gap-2">
                        {statusCounts.critical > 0 && (
                            <span className="badge bg-danger">{statusCounts.critical} {t('critical')}</span>
                        )}
                        {statusCounts.warning > 0 && (
                            <span className="badge bg-warning text-dark">{statusCounts.warning} {t('warning')}</span>
                        )}
                        <span className="badge bg-success">{statusCounts.normal || 0} {t('stable')}</span>
                    </div>
                </div>

                {/* Patient Dropdown Selector - Modern */}
                <div className="patient-dropdown-selector mb-3" ref={dropdownRef} style={{ position: 'relative', zIndex: 200 }}>
                    <small className="theme-text-muted d-block mb-2" style={{ color: 'var(--text-muted)' }}>{t('selectPatient')}</small>
                    <div className="position-relative">
                        {/* Dropdown Trigger */}
                        <div
                            className="dropdown-trigger d-flex align-items-center justify-content-between p-2 rounded"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                backgroundColor: 'var(--bg-input, #1a2332)',
                                border: `2px solid ${getStatusColor(selectedStatus)}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                {selectedPatient && (
                                    <>
                                        <span style={{ fontSize: '1.2rem' }}>{getConditionIcon(selectedPatient.condition)}</span>
                                        <div
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: getStatusColor(selectedStatus),
                                                boxShadow: `0 0 8px ${getStatusColor(selectedStatus)}50`,
                                                animation: selectedStatus === 'critical' ? 'pulse 1s infinite' : 'none'
                                            }}
                                        />
                                        <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{selectedPatient.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {selectedPatient.ambulance}</span>
                                    </>
                                )}
                            </div>
                            <span style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-secondary)' }}>
                                ▼
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div
                                className="dropdown-menu-custom position-absolute w-100 mt-1 rounded"
                                style={{
                                    backgroundColor: 'var(--bg-card, #1a2332)',
                                    border: '1px solid var(--border-color)',
                                    zIndex: 1000,
                                    boxShadow: '0 10px 40px var(--shadow-color)',
                                    animation: 'slideDown 0.2s ease',
                                    maxHeight: '350px',
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}
                            >
                                {patients.map(patient => {
                                    const pData = allPatientsData[patient.id];
                                    const pStatus = pData?.status || 'normal';
                                    const pVitals = pData?.vitals || {};
                                    const isSelected = patient.id === selectedPatientId;

                                    return (
                                        <div
                                            key={patient.id}
                                            className="dropdown-item-custom d-flex align-items-center gap-3 p-3"
                                            onClick={() => { onSelectPatient(patient.id); setIsDropdownOpen(false); }}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? 'var(--accent-blue, rgba(59, 130, 246, 0.2))' : 'transparent',
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background-color 0.15s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? 'var(--accent-blue, rgba(59, 130, 246, 0.2))' : 'transparent'}
                                        >
                                            {/* Condition Icon */}
                                            <span style={{ fontSize: '1.5rem' }}>{getConditionIcon(patient.condition)}</span>

                                            {/* Status Dot */}
                                            <div
                                                style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    backgroundColor: getStatusColor(pStatus),
                                                    boxShadow: `0 0 8px ${getStatusColor(pStatus)}50`,
                                                    animation: pStatus === 'critical' ? 'pulse 1s infinite' : 'none',
                                                    flexShrink: 0
                                                }}
                                            />

                                            {/* Patient Info */}
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{patient.name}</span>
                                                    <span className="badge" style={{
                                                        backgroundColor: getStatusColor(pStatus),
                                                        fontSize: '0.65rem',
                                                        color: '#fff'
                                                    }}>
                                                        {pStatus.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="d-flex gap-3 mt-1">
                                                    <small style={{ color: 'var(--text-muted)' }}>🚑 {patient.ambulance}</small>
                                                    <small style={{ color: 'var(--text-muted)' }}>📍 {patient.location}</small>
                                                </div>
                                                <div className="d-flex gap-3 mt-1">
                                                    <small style={{ color: pVitals.heartRate > 120 ? 'var(--status-critical)' : 'var(--text-secondary)' }}>❤️ {pVitals.heartRate || '--'}</small>
                                                    <small style={{ color: pVitals.spo2 < 90 ? 'var(--status-critical)' : 'var(--text-secondary)' }}>🫁 {pVitals.spo2 || '--'}%</small>
                                                    <small style={{ color: pVitals.temperature > 38.5 ? 'var(--status-critical)' : 'var(--text-secondary)' }}>🌡️ {pVitals.temperature?.toFixed(1) || '--'}°</small>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Patient Details Card */}
                {selectedPatient && (
                    <div
                        className="selected-patient-card p-3 rounded"
                        style={{
                            backgroundColor: getStatusBg(selectedStatus),
                            border: `2px solid ${getStatusColor(selectedStatus)}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            {/* Patient Info */}
                            <div className="patient-info">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span style={{ fontSize: '1.5rem' }}>{getConditionIcon(selectedPatient.condition)}</span>
                                    <div>
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{selectedPatient.name}</h5>
                                        <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent-blue)', color: '#fff' }}>{t('monitoring').toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="small mb-2" style={{ color: 'var(--text-muted)' }}>
                                    <div className="mb-1">🚑 <strong style={{ color: 'var(--text-secondary)' }}>{selectedPatient.ambulance}</strong></div>
                                    <div>📍 {selectedPatient.location}</div>
                                </div>
                                <span className="badge" style={{
                                    backgroundColor: getStatusBg(selectedStatus),
                                    color: getStatusColor(selectedStatus),
                                    fontSize: '0.75rem',
                                    border: `1px solid ${getStatusColor(selectedStatus)}`
                                }}>
                                    {selectedPatient.condition}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="text-end">
                                <span className="badge" style={{
                                    backgroundColor: getStatusColor(selectedStatus),
                                    fontSize: '0.8rem',
                                    padding: '8px 12px',
                                    color: '#fff'
                                }}>
                                    {selectedStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Vitals Summary */}
                        {selectedData && (
                            <div className="vitals-summary pt-3 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                            <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('heartRate')}</span>
                                            <span className="d-block fw-bold" style={{
                                                color: selectedVitals.heartRate > 120 ? 'var(--status-critical)' : selectedVitals.heartRate > 100 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                fontSize: '1.2rem'
                                            }}>
                                                {selectedVitals.heartRate || '--'} <small style={{ color: 'var(--text-muted)' }}>{t('bpm')}</small>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                            <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('spo2')}</span>
                                            <span className="d-block fw-bold" style={{
                                                color: selectedVitals.spo2 < 90 ? 'var(--status-critical)' : selectedVitals.spo2 < 95 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                fontSize: '1.2rem'
                                            }}>
                                                {selectedVitals.spo2 || '--'}<small style={{ color: 'var(--text-muted)' }}>%</small>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                            <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('temperature')}</span>
                                            <span className="d-block fw-bold" style={{
                                                color: selectedVitals.temperature > 38.5 ? 'var(--status-critical)' : selectedVitals.temperature > 37.5 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                fontSize: '1.2rem'
                                            }}>
                                                {selectedVitals.temperature?.toFixed(1) || '--'}<small style={{ color: 'var(--text-muted)' }}>{t('celsius')}</small>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Network Stats */}
                <div className="network-summary mt-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                    <div className="d-flex justify-content-around text-center">
                        <div>
                            <small className="d-block" style={{ color: 'var(--text-muted)' }}>{t('totalNodes')}</small>
                            <span className="fw-bold" style={{ color: 'var(--accent-cyan)' }}>{patients.length}</span>
                        </div>
                        <div>
                            <small className="d-block" style={{ color: 'var(--text-muted)' }}>{t('dataStreams')}</small>
                            <span className="fw-bold" style={{ color: 'var(--status-normal)' }}>{patients.length * 3}</span>
                        </div>
                        <div>
                            <small className="d-block" style={{ color: 'var(--text-muted)' }}>{t('iotNetwork')}</small>
                            <span className="fw-bold" style={{ color: 'var(--accent-blue)' }}>{t('active')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .dropdown-trigger:hover {
                    background-color: var(--bg-card-hover) !important;
                }
                .patient-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px var(--shadow-color);
                }
                .dropdown-menu-custom::-webkit-scrollbar {
                    width: 6px;
                }
                .dropdown-menu-custom::-webkit-scrollbar-track {
                    background: var(--bg-input);
                }
                .dropdown-menu-custom::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 3px;
                }
                .dropdown-menu-custom::-webkit-scrollbar-thumb:hover {
                    background: var(--text-muted);
                }
            `}</style>
        </div>
    );
}

export default MultiPatientCard;