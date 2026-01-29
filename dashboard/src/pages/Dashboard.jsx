/**
 * LifeLink Twin - Dashboard Page
 * 
 * Main dashboard with vital signs overview and multi-patient support.
 * Role-based views:
 * - Medical Staff (Doctor/Nurse): Patient vitals, health data, medical info
 * - Admin: System infrastructure, network stats, technical monitoring
 */
import HeartRateCard from '../components/HeartRateCard';
import Spo2Card from '../components/Spo2Card';
import TemperatureCard from '../components/TemperatureCard';
import StatusCard from '../components/StatusCard';
import EventLogCard from '../components/EventLogCard';
import PatientLogCard from '../components/PatientLogCard';
import NetworkStatsCard from '../components/NetworkStatsCard';
import AmbulanceTrackerCard from '../components/AmbulanceTrackerCard';
import PredictiveHealthCard from '../components/PredictiveHealthCard';
import EdgeCloudVisualizerCard from '../components/EdgeCloudVisualizerCard';
import NetworkQoSCard from '../components/NetworkQoSCard';
import HospitalReadinessCard from '../components/HospitalReadinessCard';
import ScenarioPlaybackCard from '../components/ScenarioPlaybackCard';
import MultiPatientCard from '../components/MultiPatientCard';
// Advanced Features - Phase 2
import AIExplanationCard from '../components/AIExplanationCard';
import HandoverReportCard from '../components/HandoverReportCard';
import EmergencyEscalationCard from '../components/EmergencyEscalationCard';
import EdgeFailureBackupCard from '../components/EdgeFailureBackupCard';
import DigitalTwinVisualizationCard from '../components/DigitalTwinVisualizationCard';
import NationalEmergencyNetworkCard from '../components/NationalEmergencyNetworkCard';
// AI Treatment Recommendations
import AITreatmentRecommendationCard from '../components/AITreatmentRecommendationCard';

// Role-Based Access Control
import { isMedicalRole, isAdminRole, getRoleDisplayName, getRoleIcon } from '../utils/rbac';

function Dashboard({
    patientData,
    history,
    events,
    patientLogs,
    connected,
    latency,
    lastUpdate,
    patients,
    allPatientsData,
    selectedPatientId,
    onSelectPatient,
    userRole // New prop for RBAC
}) {
    const vitals = patientData?.vitals || {};
    const status = patientData?.status || 'normal';

    // Medical Staff Dashboard
    if (isMedicalRole(userRole)) {
        return (
            <>
                {/* Page Header - Medical */}
                <div className="page-header mb-4">
                    <h1 className="page-title">{getRoleIcon(userRole)} Patient Care Dashboard</h1>
                    <p className="page-subtitle">
                        Real-time patient monitoring • {patients?.length || 0} Digital Twins Active
                        {patientData && (
                            <span className="ms-2 badge bg-info">
                                Viewing: {patientData.patientName} ({patientData.ambulance})
                            </span>
                        )}
                    </p>
                </div>

                <div className="container-fluid px-0">
                    {/* Multi-Patient Overview */}
                    {patients && patients.length > 0 && (
                        <div className="row g-3 mb-3">
                            <div className="col-12">
                                <MultiPatientCard
                                    patients={patients}
                                    allPatientsData={allPatientsData}
                                    selectedPatientId={selectedPatientId}
                                    onSelectPatient={onSelectPatient}
                                />
                            </div>
                        </div>
                    )}

                    {/* Vital Signs Row */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                            <HeartRateCard
                                value={vitals.heartRate}
                                history={history}
                                status={status}
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <Spo2Card
                                value={vitals.spo2}
                                status={status}
                            />
                        </div>
                    </div>

                    {/* Temperature & Status */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                            <TemperatureCard
                                value={vitals.temperature}
                                status={status}
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <StatusCard
                                status={status}
                                patientName={patientData?.patientName}
                                patientId={patientData?.patientId}
                                alerts={patientData?.alerts}
                            />
                        </div>
                    </div>

                    {/* AI Treatment Recommendations */}
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <AITreatmentRecommendationCard
                                vitals={vitals}
                                patientData={patientData}
                                status={status}
                            />
                        </div>
                    </div>

                    {/* Predictive Health & Hospital Readiness */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-6">
                            <PredictiveHealthCard
                                vitals={vitals}
                                history={history}
                            />
                        </div>
                        <div className="col-12 col-lg-6">
                            <HospitalReadinessCard
                                patientData={patientData}
                            />
                        </div>
                    </div>

                    {/* Ambulance Tracker */}
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <AmbulanceTrackerCard />
                        </div>
                    </div>

                    {/* Patient Vitals Log */}
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <PatientLogCard patientLogs={patientLogs} />
                        </div>
                    </div>

                    {/* Advanced Medical Section */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="section-divider d-flex align-items-center">
                                <hr className="flex-grow-1" style={{ borderColor: '#374151' }} />
                                <span className="px-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                    🧠 AI-Powered Medical Intelligence
                                </span>
                                <hr className="flex-grow-1" style={{ borderColor: '#374151' }} />
                            </div>
                        </div>
                    </div>

                    {/* AI Explanation & Handover Report */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-6">
                            <AIExplanationCard
                                vitals={vitals}
                                prediction={null}
                                patientData={patientData}
                            />
                        </div>
                        <div className="col-12 col-lg-6">
                            <HandoverReportCard
                                patientData={patientData}
                                vitals={vitals}
                                history={history}
                                ambulanceData={null}
                            />
                        </div>
                    </div>

                    {/* Emergency Escalation & Digital Twin */}
                    <div className="row g-3">
                        <div className="col-12 col-lg-6">
                            <EmergencyEscalationCard
                                patientData={patientData}
                                vitals={vitals}
                            />
                        </div>
                        <div className="col-12 col-lg-6">
                            <DigitalTwinVisualizationCard
                                vitals={vitals}
                                patientData={patientData}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Admin Dashboard - System/Technical View
    if (isAdminRole(userRole)) {
        return (
            <>
                {/* Page Header - Admin */}
                <div className="page-header mb-4">
                    <h1 className="page-title">{getRoleIcon(userRole)} System Administration</h1>
                    <p className="page-subtitle">
                        Infrastructure Monitoring • Network Status • Edge Computing
                        <span className={`ms-2 badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                            {connected ? '● System Online' : '○ System Offline'}
                        </span>
                    </p>
                </div>

                <div className="container-fluid px-0">
                    {/* Connection Status Overview */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4">
                            <div className="card h-100" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0d47a1 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">🌐</h3>
                                    <h5 className="text-white">System Status</h5>
                                    <h2 className={`${connected ? 'text-success' : 'text-danger'}`}>
                                        {connected ? 'ONLINE' : 'OFFLINE'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card h-100" style={{ background: 'linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">⚡</h3>
                                    <h5 className="text-white">Network Latency</h5>
                                    <h2 className="text-success">{latency || 0}ms</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card h-100" style={{ background: 'linear-gradient(135deg, #4a1a6b 0%, #7b1fa2 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">📡</h3>
                                    <h5 className="text-white">Active Connections</h5>
                                    <h2 className="text-info">{patients?.length || 0}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edge/Cloud Visualizer & Network QoS */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-6">
                            <EdgeCloudVisualizerCard connected={connected} />
                        </div>
                        <div className="col-12 col-lg-6">
                            <NetworkQoSCard connected={connected} latency={latency} />
                        </div>
                    </div>

                    {/* Edge Failure Backup & National Network */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-6">
                            <EdgeFailureBackupCard connected={connected} />
                        </div>
                        <div className="col-12 col-lg-6">
                            <NationalEmergencyNetworkCard />
                        </div>
                    </div>

                    {/* System Event Log & Network Stats */}
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-8">
                            <EventLogCard events={events} />
                        </div>
                        <div className="col-12 col-lg-4">
                            <NetworkStatsCard
                                connected={connected}
                                latency={latency}
                                packetRate={1}
                                lastUpdate={lastUpdate}
                            />
                        </div>
                    </div>

                    {/* Scenario Playback */}
                    <div className="row g-3">
                        <div className="col-12">
                            <ScenarioPlaybackCard />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Fallback - Default view (shouldn't normally reach here)
    return (
        <div className="page-header mb-4">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Please contact administrator for access.</p>
        </div>
    );
}

export default Dashboard;
