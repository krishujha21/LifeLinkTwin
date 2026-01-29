/**
 * LifeLink Twin - AI Treatment Recommendation Card
 * 
 * AI-powered treatment recommendations based on real-time vitals
 * and patient condition analysis.
 */

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../i18n';

function AITreatmentRecommendationCard({ vitals, patientData, status }) {
    const { t } = useLanguage();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedRecommendation, setExpandedRecommendation] = useState(null);

    // Simulate AI analysis when vitals change significantly
    useEffect(() => {
        setIsAnalyzing(true);
        const timer = setTimeout(() => setIsAnalyzing(false), 800);
        return () => clearTimeout(timer);
    }, [status, vitals?.heartRate, vitals?.spo2]);

    // Generate AI recommendations based on vitals and status
    const recommendations = useMemo(() => {
        const recs = [];
        const hr = vitals?.heartRate || 75;
        const spo2 = vitals?.spo2 || 98;
        const temp = vitals?.temperature || 36.6;
        const condition = patientData?.condition || 'General';

        // Critical status recommendations
        if (status === 'critical') {
            recs.push({
                id: 1,
                priority: 'critical',
                icon: '🚨',
                title: 'Immediate Intervention Required',
                description: 'Patient vitals indicate critical condition. Immediate medical intervention necessary.',
                actions: [
                    'Prepare emergency resuscitation equipment',
                    'Administer oxygen therapy (15L/min via non-rebreather)',
                    'Establish IV access with large bore cannula',
                    'Prepare defibrillator on standby',
                    'Alert receiving hospital trauma team'
                ],
                confidence: 98,
                source: 'Emergency Protocol AI v2.1'
            });
        }

        // Heart rate based recommendations
        if (hr > 120) {
            recs.push({
                id: 2,
                priority: 'high',
                icon: '❤️',
                title: 'Tachycardia Management',
                description: `Heart rate elevated at ${hr} BPM. Consider underlying causes and appropriate intervention.`,
                actions: [
                    'Monitor 12-lead ECG for arrhythmias',
                    'Assess for pain, anxiety, or hypovolemia',
                    'Consider beta-blocker if hemodynamically stable',
                    'Check electrolyte levels',
                    'Continuous cardiac monitoring'
                ],
                confidence: 94,
                source: 'Cardiac Care Protocol'
            });
        } else if (hr < 50) {
            recs.push({
                id: 3,
                priority: 'high',
                icon: '💓',
                title: 'Bradycardia Protocol',
                description: `Heart rate low at ${hr} BPM. Evaluate for symptomatic bradycardia.`,
                actions: [
                    'Assess patient responsiveness and symptoms',
                    'Prepare atropine 0.5mg IV if symptomatic',
                    'Consider transcutaneous pacing',
                    'Evaluate medication history (beta-blockers, CCBs)',
                    'Monitor blood pressure closely'
                ],
                confidence: 92,
                source: 'ACLS Guidelines'
            });
        }

        // SpO2 based recommendations
        if (spo2 < 92) {
            recs.push({
                id: 4,
                priority: spo2 < 88 ? 'critical' : 'high',
                icon: '🫁',
                title: 'Oxygen Therapy Required',
                description: `SpO2 at ${spo2}% indicates hypoxemia. Immediate oxygen supplementation recommended.`,
                actions: [
                    `Start O2 at ${spo2 < 88 ? '15L/min via non-rebreather' : '4-6L/min via nasal cannula'}`,
                    'Position patient upright if possible',
                    'Assess for respiratory distress signs',
                    'Consider bronchodilator nebulization',
                    'Prepare for potential intubation if no improvement'
                ],
                confidence: 96,
                source: 'Respiratory Care AI'
            });
        }

        // Temperature based recommendations
        if (temp > 38.5) {
            recs.push({
                id: 5,
                priority: 'medium',
                icon: '🌡️',
                title: 'Fever Management',
                description: `Temperature elevated at ${temp}°C. Consider antipyretic therapy and infection workup.`,
                actions: [
                    'Administer Paracetamol 1g IV/PO',
                    'Apply cooling measures (tepid sponging)',
                    'Collect blood cultures if infection suspected',
                    'Ensure adequate hydration',
                    'Monitor for signs of sepsis'
                ],
                confidence: 89,
                source: 'Infection Control Protocol'
            });
        } else if (temp < 35) {
            recs.push({
                id: 6,
                priority: 'high',
                icon: '❄️',
                title: 'Hypothermia Alert',
                description: `Core temperature at ${temp}°C indicates hypothermia. Active warming required.`,
                actions: [
                    'Apply warm blankets and Bair Hugger',
                    'Administer warm IV fluids (38-40°C)',
                    'Monitor for cardiac arrhythmias',
                    'Avoid rough handling (risk of VF)',
                    'Continuous temperature monitoring'
                ],
                confidence: 91,
                source: 'Hypothermia Protocol'
            });
        }

        // Condition-specific recommendations
        if (condition === 'Cardiac') {
            recs.push({
                id: 7,
                priority: status === 'critical' ? 'critical' : 'medium',
                icon: '💊',
                title: 'Cardiac Protocol',
                description: 'Patient presents with cardiac condition. Standard cardiac care protocol recommended.',
                actions: [
                    'Administer Aspirin 300mg (if not contraindicated)',
                    'Sublingual GTN for chest pain',
                    'Continuous 12-lead ECG monitoring',
                    'Prepare for potential PCI',
                    'Morphine for persistent pain'
                ],
                confidence: 95,
                source: 'ACS Guidelines AI'
            });
        } else if (condition === 'Stroke') {
            recs.push({
                id: 8,
                priority: 'critical',
                icon: '🧠',
                title: 'Stroke Protocol - Time Critical',
                description: 'Suspected stroke. Every minute counts - activate stroke pathway.',
                actions: [
                    'Document symptom onset time',
                    'Perform FAST assessment',
                    'Maintain BP but avoid aggressive lowering',
                    'NPO - nil by mouth',
                    'Alert stroke team at receiving hospital',
                    'Consider tPA eligibility (< 4.5 hours)'
                ],
                confidence: 97,
                source: 'Stroke Protocol AI'
            });
        } else if (condition === 'Trauma') {
            recs.push({
                id: 9,
                priority: status === 'critical' ? 'critical' : 'high',
                icon: '🩹',
                title: 'Trauma Management',
                description: 'Trauma patient - follow ATLS principles.',
                actions: [
                    'Primary survey: ABCDE',
                    'Control visible hemorrhage',
                    'Immobilize cervical spine',
                    'Two large bore IV access',
                    'Consider TXA if significant bleeding',
                    'Cross-match blood products'
                ],
                confidence: 93,
                source: 'ATLS Protocol AI'
            });
        }

        // Add general supportive care if stable
        if (recs.length === 0 || status === 'normal') {
            recs.push({
                id: 10,
                priority: 'low',
                icon: '✅',
                title: 'Continued Monitoring',
                description: 'Patient vitals within acceptable range. Continue current management.',
                actions: [
                    'Maintain continuous vital sign monitoring',
                    'Regular neurological assessments',
                    'Ensure patient comfort',
                    'Keep family informed',
                    'Document all findings'
                ],
                confidence: 99,
                source: 'Standard Care Protocol'
            });
        }

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }, [vitals, patientData, status]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' };
            case 'high': return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b' };
            case 'medium': return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#3b82f6' };
            default: return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981' };
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'critical': return 'CRITICAL';
            case 'high': return 'HIGH';
            case 'medium': return 'MEDIUM';
            default: return 'ROUTINE';
        }
    };

    return (
        <div className="card vital-card h-100">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🤖</span>
                        <span className="vital-title">AI Treatment Recommendations</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {isAnalyzing ? (
                            <span className="badge" style={{ 
                                background: 'rgba(139, 92, 246, 0.2)', 
                                color: '#a78bfa',
                                animation: 'pulse 1s infinite'
                            }}>
                                <span style={{ marginRight: '4px' }}>⚡</span> Analyzing...
                            </span>
                        ) : (
                            <span className="badge" style={{ 
                                background: 'rgba(16, 185, 129, 0.2)', 
                                color: '#10b981'
                            }}>
                                <span style={{ marginRight: '4px' }}>✓</span> AI Ready
                            </span>
                        )}
                    </div>
                </div>

                {/* AI Engine Info */}
                <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded" style={{
                    background: 'var(--bg-secondary)',
                    fontSize: '0.75rem'
                }}>
                    <span>🧠</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Powered by <strong style={{ color: 'var(--accent-purple, #8b5cf6)' }}>LifeLink AI Engine</strong> • 
                        Analyzing {recommendations.length} protocols • 
                        Last update: <span style={{ color: 'var(--accent-cyan, #06b6d4)' }}>{new Date().toLocaleTimeString()}</span>
                    </span>
                </div>

                {/* Recommendations List */}
                <div className="recommendations-list" style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    paddingRight: '4px'
                }}>
                    {recommendations.map((rec, index) => {
                        const colors = getPriorityColor(rec.priority);
                        const isExpanded = expandedRecommendation === rec.id;

                        return (
                            <div 
                                key={rec.id}
                                className="recommendation-item mb-2"
                                style={{
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: isExpanded ? 'scale(1.01)' : 'scale(1)'
                                }}
                                onClick={() => setExpandedRecommendation(isExpanded ? null : rec.id)}
                            >
                                {/* Recommendation Header */}
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontSize: '1.25rem' }}>{rec.icon}</span>
                                        <div>
                                            <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {rec.title}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <span 
                                                    className="badge"
                                                    style={{ 
                                                        background: colors.border, 
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {getPriorityLabel(rec.priority)}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    color: 'var(--text-muted)' 
                                                }}>
                                                    {rec.confidence}% confidence
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        color: 'var(--text-muted)',
                                        transition: 'transform 0.2s',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        ▼
                                    </span>
                                </div>

                                {/* Description */}
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--text-secondary)',
                                    marginBottom: isExpanded ? '12px' : '0',
                                    lineHeight: 1.5
                                }}>
                                    {rec.description}
                                </p>

                                {/* Expanded Actions */}
                                {isExpanded && (
                                    <div 
                                        className="actions-list mt-2 pt-2"
                                        style={{ 
                                            borderTop: `1px solid ${colors.border}`,
                                            animation: 'fadeIn 0.3s ease'
                                        }}
                                    >
                                        <div className="fw-bold mb-2" style={{ 
                                            fontSize: '0.75rem', 
                                            color: colors.text,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Recommended Actions:
                                        </div>
                                        <ol style={{ 
                                            paddingLeft: '1.25rem', 
                                            margin: 0,
                                            fontSize: '0.8rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {rec.actions.map((action, idx) => (
                                                <li key={idx} style={{ marginBottom: '6px', lineHeight: 1.4 }}>
                                                    {action}
                                                </li>
                                            ))}
                                        </ol>
                                        <div className="mt-2 pt-2" style={{ 
                                            borderTop: '1px dashed var(--border-color)',
                                            fontSize: '0.7rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <span>📚 Source: {rec.source}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-2 d-flex justify-content-between align-items-center" style={{
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)'
                }}>
                    <span>
                        ⚕️ AI recommendations are advisory only. Clinical judgment required.
                    </span>
                    <span className="badge" style={{ 
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)'
                    }}>
                        v2.1 • HIPAA Compliant
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .recommendation-item:hover {
                    transform: translateX(4px) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .recommendations-list::-webkit-scrollbar {
                    width: 4px;
                }
                
                .recommendations-list::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                    border-radius: 2px;
                }
                
                .recommendations-list::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 2px;
                }
                
                .recommendations-list::-webkit-scrollbar-thumb:hover {
                    background: var(--text-muted);
                }
            `}</style>
        </div>
    );
}

export default AITreatmentRecommendationCard;
