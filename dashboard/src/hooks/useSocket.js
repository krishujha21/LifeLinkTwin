/**
 * LifeLink Twin — useSocket hook
 * Connects to the backend Socket.io server and listens for real-time events.
 * Cleans up listeners on unmount to prevent memory leaks.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '../socket';

/**
 * @param {string} patientId  - Which patient's vitals to track (e.g. "patient1")
 * @param {string} role       - 'attendant' | 'doctor' | 'hospital'
 */
export default function useSocket(patientId = 'patient1', role = 'attendant') {
    const [vitals, setVitals]         = useState(null);
    const [status, setStatus]         = useState('normal');
    const [riskScore, setRiskScore]   = useState(0);
    const [aiAssessment, setAI]       = useState('');
    const [alerts, setAlerts]         = useState([]);
    const [connected, setConnected]   = useState(socket.connected);
    const [sosReceived, setSOS]       = useState(null);  // for doctor/hospital
    const [chatMessages, setChat]     = useState([]);

    // Stable ref so event handlers don't close over stale patientId
    const patientIdRef = useRef(patientId);
    useEffect(() => { patientIdRef.current = patientId; }, [patientId]);

    // ── emit helpers ──────────────────────────────────────────────────────────

    const sendSOS = useCallback((name) => {
        const payload = {
            patientId: patientIdRef.current,
            name,
            timestamp: new Date().toISOString(),
        };
        socket.emit('sos', payload);
        console.log('🆘 SOS emitted', payload);
    }, []);

    const sendChat = useCallback((message, senderName) => {
        const payload = {
            patientId: patientIdRef.current,
            message,
            role,
            senderName,
            timestamp: new Date().toISOString(),
        };
        socket.emit('chat', payload);
        setChat(prev => [...prev, { ...payload, self: true }]);
    }, [role]);

    // ── socket event listeners ────────────────────────────────────────────────

    useEffect(() => {
        // Connection state
        const onConnect    = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        // Vitals update — server emits 'vitals-update' with { patient, history }
        const onVitals = ({ patient } = {}) => {
            if (!patient) return;

            // Doctors see all patients; attendant/hospital filter by patientId
            if (role === 'doctor' || patient.patientId === patientIdRef.current) {
                setVitals(patient.vitals || patient);
                setStatus(patient.status || 'normal');
                setRiskScore(patient.riskScore ?? 0);
                if (patient.aiAssessment) setAI(patient.aiAssessment);
                if (patient.alerts?.length) setAlerts(patient.alerts);
            }
        };

        // Patient alert (warning / critical events)
        const onAlert = (data) => {
            if (role === 'doctor' || data.patientId === patientIdRef.current) {
                if (data.alerts?.length) {
                    setAlerts(prev => [...data.alerts, ...prev].slice(0, 10));
                }
                if (data.aiAssessment) setAI(data.aiAssessment);
            }
        };

        // SOS from attendant
        const onSOS = (data) => {
            setSOS(data);
            console.log('🆘 SOS received:', data);
        };

        // Chat messages
        const onChat = (data) => {
            if (data.patientId === patientIdRef.current) {
                setChat(prev => [...prev, { ...data, self: false }]);
            }
        };

        socket.on('connect',        onConnect);
        socket.on('disconnect',     onDisconnect);
        socket.on('vitals-update',  onVitals);
        socket.on('patient-alert',  onAlert);
        socket.on('sos',            onSOS);
        socket.on('chat',           onChat);

        // Subscribe this client to the patient room
        if (socket.connected) {
            socket.emit('subscribe-patient', patientId);
        }
        socket.on('connect', () => {
            socket.emit('subscribe-patient', patientIdRef.current);
        });

        return () => {
            socket.off('connect',        onConnect);
            socket.off('disconnect',     onDisconnect);
            socket.off('vitals-update',  onVitals);
            socket.off('patient-alert',  onAlert);
            socket.off('sos',            onSOS);
            socket.off('chat',           onChat);
        };
    }, [role]); // re-run only if role changes

    return {
        vitals,
        status,
        riskScore,
        aiAssessment,
        alerts,
        connected,
        sosReceived,
        chatMessages,
        sendSOS,
        sendChat,
        clearSOS: () => setSOS(null),
    };
}
