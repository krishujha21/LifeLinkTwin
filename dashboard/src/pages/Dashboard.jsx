/**
 * LifeLink Twin - Dashboard Page
 * 
 * Main dashboard with vital signs overview and multi-patient support
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
    onSelectPatient
}) {
    const vitals = patientData?.vitals || {};
    const status = patientData?.status || 'normal';

    return (
        <>
            {/* Page Header */}
            <div className="page-header mb-4">
                <h1 className="page-title">Live Patient Monitor</h1>
                <p className="page-subtitle">
                    Real-time vital signs monitoring • {patients?.length || 0} Digital Twins Active
                    {patientData && (
                        <span className="ms-2 badge bg-info">
                            Viewing: {patientData.patientName} ({patientData.ambulance})
                        </span>
                    )}
                </p>
            </div>

            {/* Bootstrap Grid Layout */}
            <div className="container-fluid px-0">
                {/* Row 0: Multi-Patient Overview */}
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

                {/* Row 1: Heart Rate & SpO2 */}
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

                {/* Row 2: Temperature & Status */}
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

                {/* Row 3: Predictive Health & Hospital Readiness */}
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

                {/* Row 4: Ambulance Tracker */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <AmbulanceTrackerCard />
                    </div>
                </div>

                {/* Row 5: Edge/Cloud Visualizer & Network QoS */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-lg-6">
                        <EdgeCloudVisualizerCard connected={connected} />
                    </div>
                    <div className="col-12 col-lg-6">
                        <NetworkQoSCard connected={connected} latency={latency} />
                    </div>
                </div>

                {/* Row 6: Patient Vitals Log & System Event Log */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-lg-6">
                        <PatientLogCard patientLogs={patientLogs} />
                    </div>
                    <div className="col-12 col-lg-6">
                        <EventLogCard events={events} />
                    </div>
                </div>

                {/* Row 7: Scenario Playback & Network Stats */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-lg-8">
                        <ScenarioPlaybackCard />
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

                {/* ============================================ */}
                {/* ADVANCED FEATURES - Phase 2 */}
                {/* ============================================ */}

                {/* Section Header */}
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="section-divider d-flex align-items-center">
                            <hr className="flex-grow-1" style={{ borderColor: '#374151' }} />
                            <span className="px-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                🚀 Advanced Intelligence & Network Features
                            </span>
                            <hr className="flex-grow-1" style={{ borderColor: '#374151' }} />
                        </div>
                    </div>
                </div>

                {/* Row 8: AI Explanation & Handover Report */}
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

                {/* Row 9: Emergency Escalation & Digital Twin */}
                <div className="row g-3 mb-3">
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

                {/* Row 10: Edge Failure Backup & National Network */}
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <EdgeFailureBackupCard
                            connected={connected}
                        />
                    </div>
                    <div className="col-12 col-lg-6">
                        <NationalEmergencyNetworkCard />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
