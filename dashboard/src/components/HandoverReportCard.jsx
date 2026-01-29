/**
 * LifeLink Twin - Ambulance-to-Hospital Handover Report (Auto Generated)
 * 
 * Automatically generates comprehensive handover documentation including:
 * - Patient demographics and condition summary
 * - Vital signs history and trends
 * - Interventions performed in ambulance
 * - Medication administered
 * - Estimated severity scoring
 * - PDF export capability
 */

import { useState, useEffect, useCallback } from 'react';

function HandoverReportCard({ patientData, vitals, history, ambulanceData }) {
    const [report, setReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFullReport, setShowFullReport] = useState(false);
    const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

    // Generate comprehensive handover report
    const generateReport = useCallback(() => {
        if (!patientData || !vitals) return null;

        const now = new Date();
        const hr = vitals.heartRate || 75;
        const spo2 = vitals.spo2 || 97;
        const temp = vitals.temperature || 36.8;

        // Calculate vital trends
        const hrTrend = history?.heartRate?.length > 5
            ? (history.heartRate.slice(-1)[0] - history.heartRate.slice(-5)[0]) / 5
            : 0;
        const spo2Trend = history?.spo2?.length > 5
            ? (history.spo2.slice(-1)[0] - history.spo2.slice(-5)[0]) / 5
            : 0;

        // Calculate NEWS2 Score (National Early Warning Score)
        let news2 = 0;
        // Respiratory rate (simulated)
        const respRate = 16 + Math.floor(Math.random() * 4);
        if (respRate <= 8 || respRate >= 25) news2 += 3;
        else if (respRate >= 21 && respRate <= 24) news2 += 2;
        else if ((respRate >= 9 && respRate <= 11) || (respRate >= 12 && respRate <= 20)) news2 += 0;

        // SpO2
        if (spo2 <= 91) news2 += 3;
        else if (spo2 >= 92 && spo2 <= 93) news2 += 2;
        else if (spo2 >= 94 && spo2 <= 95) news2 += 1;

        // Heart Rate
        if (hr <= 40 || hr >= 131) news2 += 3;
        else if ((hr >= 41 && hr <= 50) || (hr >= 111 && hr <= 130)) news2 += 2;
        else if (hr >= 91 && hr <= 110) news2 += 1;

        // Temperature
        if (temp <= 35.0) news2 += 3;
        else if (temp >= 39.1) news2 += 2;
        else if ((temp >= 35.1 && temp <= 36.0) || (temp >= 38.1 && temp <= 39.0)) news2 += 1;

        // Consciousness (GCS - simulated)
        const gcs = patientData.status === 'critical' ? 12 : 15;
        if (gcs < 15) news2 += 3;

        // Simulated interventions based on condition
        const interventions = [];
        if (spo2 < 94) interventions.push({ time: '5 min ago', action: 'Oxygen therapy initiated', dose: '4L/min nasal cannula' });
        if (hr > 110) interventions.push({ time: '8 min ago', action: 'IV access established', dose: 'Right arm 18G' });
        if (patientData.status === 'critical') {
            interventions.push({ time: '3 min ago', action: 'Cardiac monitoring initiated', dose: '12-lead ECG' });
            interventions.push({ time: '2 min ago', action: 'NS bolus administered', dose: '500ml' });
        }
        if (interventions.length === 0) {
            interventions.push({ time: '10 min ago', action: 'Baseline assessment completed', dose: 'All vitals documented' });
        }

        // Medications (simulated)
        const medications = [];
        if (patientData.status === 'critical') {
            medications.push({ name: 'Aspirin', dose: '324mg PO', time: '7 min ago', route: 'Oral' });
        }
        if (temp > 38.5) {
            medications.push({ name: 'Paracetamol', dose: '1000mg IV', time: '5 min ago', route: 'IV' });
        }
        if (hr > 120) {
            medications.push({ name: 'Metoprolol', dose: '5mg IV', time: '4 min ago', route: 'IV' });
        }

        return {
            generatedAt: now.toISOString(),
            reportId: `HR-${now.getTime().toString(36).toUpperCase()}`,

            // Patient Info
            patient: {
                name: patientData.patientName || 'Unknown',
                id: patientData.patientId || 'N/A',
                age: 45, // Simulated
                gender: 'Male',
                bloodType: 'O+',
                allergies: ['Penicillin'],
                medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
                emergencyContact: '+91 98765 43210'
            },

            // Transport Info
            transport: {
                ambulanceId: patientData.ambulance || 'AMB-001',
                dispatchTime: new Date(now - 25 * 60000).toLocaleTimeString(),
                pickupTime: new Date(now - 20 * 60000).toLocaleTimeString(),
                eta: ambulanceData?.eta || '8 min',
                location: ambulanceData?.location || 'En route to City General',
                distance: ambulanceData?.distance || '5.2 km',
                crew: ['Paramedic: John Smith', 'EMT: Sarah Lee']
            },

            // Chief Complaint
            chiefComplaint: {
                primary: patientData.condition || 'Chest Pain',
                onset: '45 minutes ago',
                duration: '45 min',
                severity: patientData.status === 'critical' ? '9/10' : patientData.status === 'warning' ? '6/10' : '3/10',
                character: 'Crushing, radiating to left arm',
                associated: ['Dyspnea', 'Diaphoresis', 'Nausea']
            },

            // Current Vitals
            vitals: {
                heartRate: { value: hr, unit: 'BPM', trend: hrTrend > 0 ? 'increasing' : hrTrend < 0 ? 'decreasing' : 'stable' },
                spo2: { value: spo2, unit: '%', trend: spo2Trend > 0 ? 'improving' : spo2Trend < 0 ? 'declining' : 'stable' },
                temperature: { value: temp, unit: '°C' },
                bloodPressure: { systolic: 142 + Math.floor(Math.random() * 10), diastolic: 88 + Math.floor(Math.random() * 5) },
                respiratoryRate: respRate,
                gcs: gcs,
                painScore: patientData.status === 'critical' ? 8 : patientData.status === 'warning' ? 5 : 2
            },

            // Scoring
            scoring: {
                news2: news2,
                news2Risk: news2 >= 7 ? 'High' : news2 >= 5 ? 'Medium' : 'Low',
                triageCategory: patientData.status === 'critical' ? 'RED - Immediate' :
                    patientData.status === 'warning' ? 'YELLOW - Urgent' : 'GREEN - Standard'
            },

            // Interventions & Medications
            interventions,
            medications,

            // Recommendations
            recommendations: [
                patientData.status === 'critical' ? 'Activate cardiac catheterization lab' : null,
                spo2 < 94 ? 'Continue oxygen therapy' : null,
                'Serial troponin levels',
                'Continuous cardiac monitoring',
                'Prepare for possible admission'
            ].filter(Boolean)
        };
    }, [patientData, vitals, history, ambulanceData]);

    // Auto-update report
    useEffect(() => {
        if (autoUpdateEnabled) {
            const newReport = generateReport();
            if (newReport) setReport(newReport);
        }
    }, [generateReport, autoUpdateEnabled]);

    // Manual regenerate
    const handleRegenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setReport(generateReport());
            setIsGenerating(false);
        }, 500);
    };

    // Export to clipboard (simulating PDF export)
    const handleExport = () => {
        if (!report) return;

        const textReport = `
LIFELINK TWIN - HANDOVER REPORT
================================
Report ID: ${report.reportId}
Generated: ${new Date(report.generatedAt).toLocaleString()}

PATIENT INFORMATION
-------------------
Name: ${report.patient.name}
ID: ${report.patient.id}
Age: ${report.patient.age}
Blood Type: ${report.patient.bloodType}

TRANSPORT DETAILS
-----------------
Ambulance: ${report.transport.ambulanceId}
ETA: ${report.transport.eta}

CHIEF COMPLAINT
---------------
${report.chiefComplaint.primary}
Onset: ${report.chiefComplaint.onset}
Severity: ${report.chiefComplaint.severity}

CURRENT VITALS
--------------
HR: ${report.vitals.heartRate.value} BPM (${report.vitals.heartRate.trend})
SpO2: ${report.vitals.spo2.value}%
Temp: ${report.vitals.temperature.value}°C
BP: ${report.vitals.bloodPressure.systolic}/${report.vitals.bloodPressure.diastolic}
RR: ${report.vitals.respiratoryRate}/min
GCS: ${report.vitals.gcs}/15

SCORING
-------
NEWS2: ${report.scoring.news2} (${report.scoring.news2Risk} Risk)
Triage: ${report.scoring.triageCategory}

INTERVENTIONS
-------------
${report.interventions.map(i => `- ${i.time}: ${i.action} (${i.dose})`).join('\n')}

RECOMMENDATIONS
---------------
${report.recommendations.map(r => `- ${r}`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(textReport);
        alert('Report copied to clipboard!');
    };

    const getNews2Color = (score) => {
        if (score >= 7) return 'danger';
        if (score >= 5) return 'warning';
        return 'success';
    };

    const getTriageColor = (category) => {
        if (category?.includes('RED')) return '#ef4444';
        if (category?.includes('YELLOW')) return '#f59e0b';
        return '#10b981';
    };

    if (!report) {
        return (
            <div className="card vital-card">
                <div className="card-body text-center py-5">
                    <span style={{ fontSize: '3rem' }}>📋</span>
                    <p className="text-muted mt-2">Waiting for patient data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">📋</span>
                        <span className="vital-title">Handover Report</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-info"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? '⏳' : '🔄'}
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={handleExport}
                        >
                            📤 Export
                        </button>
                    </div>
                </div>

                {/* Report ID & Time */}
                <div className="d-flex justify-content-between mb-3 p-2 bg-dark rounded">
                    <small className="text-muted">Report: {report.reportId}</small>
                    <small className="text-muted">{new Date(report.generatedAt).toLocaleTimeString()}</small>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={autoUpdateEnabled}
                            onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                        />
                        <label className="form-check-label small">Auto</label>
                    </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="row g-2 mb-3">
                    {/* Patient Card */}
                    <div className="col-6">
                        <div className="p-2 bg-dark rounded h-100">
                            <small className="text-muted d-block">Patient</small>
                            <strong>{report.patient.name}</strong>
                            <div className="small text-muted">{report.patient.age}y • {report.patient.bloodType}</div>
                        </div>
                    </div>

                    {/* NEWS2 Score */}
                    <div className="col-6">
                        <div className="p-2 bg-dark rounded h-100">
                            <small className="text-muted d-block">NEWS2 Score</small>
                            <strong className={`text-${getNews2Color(report.scoring.news2)}`} style={{ fontSize: '1.5rem' }}>
                                {report.scoring.news2}
                            </strong>
                            <span className={`badge bg-${getNews2Color(report.scoring.news2)} ms-2`}>
                                {report.scoring.news2Risk}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Triage Category */}
                <div
                    className="triage-badge p-2 rounded mb-3 text-center"
                    style={{ backgroundColor: getTriageColor(report.scoring.triageCategory), color: '#fff' }}
                >
                    <strong>{report.scoring.triageCategory}</strong>
                </div>

                {/* Chief Complaint */}
                <div className="mb-3">
                    <small className="text-muted d-block mb-1">Chief Complaint</small>
                    <div className="p-2 bg-dark rounded">
                        <strong>{report.chiefComplaint.primary}</strong>
                        <div className="small text-muted">
                            Onset: {report.chiefComplaint.onset} • Severity: {report.chiefComplaint.severity}
                        </div>
                    </div>
                </div>

                {/* Current Vitals Summary */}
                <div className="mb-3">
                    <small className="text-muted d-block mb-1">Current Vitals</small>
                    <div className="row g-2">
                        <div className="col-4">
                            <div className="vital-mini p-2 bg-dark rounded text-center">
                                <span className="d-block" style={{ fontSize: '0.8rem' }}>❤️</span>
                                <strong>{report.vitals.heartRate.value}</strong>
                                <small className="text-muted d-block">BPM</small>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="vital-mini p-2 bg-dark rounded text-center">
                                <span className="d-block" style={{ fontSize: '0.8rem' }}>🫁</span>
                                <strong>{report.vitals.spo2.value}</strong>
                                <small className="text-muted d-block">% SpO2</small>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="vital-mini p-2 bg-dark rounded text-center">
                                <span className="d-block" style={{ fontSize: '0.8rem' }}>💉</span>
                                <strong>{report.vitals.bloodPressure.systolic}/{report.vitals.bloodPressure.diastolic}</strong>
                                <small className="text-muted d-block">BP</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expandable Full Report */}
                <button
                    className="btn btn-sm btn-outline-secondary w-100 mb-2"
                    onClick={() => setShowFullReport(!showFullReport)}
                >
                    {showFullReport ? '▲ Hide Details' : '▼ Show Full Report'}
                </button>

                {showFullReport && (
                    <div className="full-report-section">
                        {/* Interventions */}
                        <div className="mb-3">
                            <small className="text-muted d-block mb-1">Interventions Performed</small>
                            <div className="interventions-list">
                                {report.interventions.map((int, idx) => (
                                    <div key={idx} className="d-flex justify-content-between p-2 bg-dark rounded mb-1">
                                        <span>{int.action}</span>
                                        <small className="text-muted">{int.dose}</small>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        {report.medications.length > 0 && (
                            <div className="mb-3">
                                <small className="text-muted d-block mb-1">Medications Administered</small>
                                <div className="medications-list">
                                    {report.medications.map((med, idx) => (
                                        <div key={idx} className="d-flex justify-content-between p-2 bg-dark rounded mb-1">
                                            <span>💊 {med.name}</span>
                                            <small className="text-muted">{med.dose} • {med.route}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="mb-3">
                            <small className="text-muted d-block mb-1">Recommended Actions</small>
                            <ul className="list-unstyled mb-0">
                                {report.recommendations.map((rec, idx) => (
                                    <li key={idx} className="d-flex align-items-center mb-1">
                                        <span className="badge bg-info me-2">•</span>
                                        <small>{rec}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Transport & Crew */}
                        <div className="transport-info p-2 bg-dark rounded">
                            <div className="row">
                                <div className="col-6">
                                    <small className="text-muted d-block">Ambulance</small>
                                    <strong>{report.transport.ambulanceId}</strong>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">ETA</small>
                                    <strong className="text-info">{report.transport.eta}</strong>
                                </div>
                            </div>
                            <div className="mt-2">
                                <small className="text-muted d-block">Crew</small>
                                {report.transport.crew.map((c, i) => (
                                    <small key={i} className="d-block">{c}</small>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HandoverReportCard;
