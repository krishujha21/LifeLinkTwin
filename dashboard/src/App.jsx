/**
 * LifeLink Twin - Main App Component
 * 
 * React dashboard for real-time emergency health monitoring.
 * Connects to backend via Socket.io and displays digital twin data.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

// Socket connection
import socket from './socket';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import {
  Dashboard,
  VitalsMonitor,
  PatientInfo,
  Alerts,
  History,
  Reports,
  Settings
} from './pages';

function App() {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme state (dark/light)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('lifelink-theme');
    return saved || 'dark';
  });

  // Simulator state
  const [simulatorOn, setSimulatorOn] = useState(false);
  const simulatorRef = useRef(null);

  // Connection state
  const [connected, setConnected] = useState(false);

  // Multi-Patient Support
  const [patients] = useState([
    { id: 'AMB-001', name: 'Divvya Singh', ambulance: 'Ambulance 1', location: 'Sector 15, Noida', condition: 'Cardiac' },
    { id: 'AMB-002', name: 'Sneha', ambulance: 'Ambulance 2', location: 'MG Road, Delhi', condition: 'Trauma' },
    { id: 'AMB-003', name: 'Nistha', ambulance: 'Ambulance 3', location: 'Connaught Place', condition: 'Respiratory' },
    { id: 'AMB-004', name: 'Shubhra', ambulance: 'Ambulance 4', location: 'Dwarka Sec 21', condition: 'Stroke' },
    { id: 'AMB-005', name: 'Aditi', ambulance: 'Ambulance 5', location: 'Gurgaon Sec 14', condition: 'Cardiac' }
  ]);
  const [selectedPatientId, setSelectedPatientId] = useState('AMB-001');
  const [allPatientsData, setAllPatientsData] = useState({});
  const [allPatientsHistory, setAllPatientsHistory] = useState({});

  // Current patient data (derived from selected)
  const patientData = allPatientsData[selectedPatientId] || null;
  const history = allPatientsHistory[selectedPatientId] || null;

  // Network stats
  const [latency, setLatency] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [packetCount, setPacketCount] = useState(0);

  // Event log (system events)
  const [events, setEvents] = useState([]);

  // Patient log (vital changes) - per patient
  const [allPatientLogs, setAllPatientLogs] = useState({});
  const patientLogs = allPatientLogs[selectedPatientId] || [];

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lifelink-theme', newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add event to log
  const addEvent = useCallback((type, message) => {
    const newEvent = {
      type,
      message,
      time: new Date().toLocaleTimeString()
    };
    setEvents(prev => [...prev.slice(-49), newEvent]); // Keep last 50 events
  }, []);

  // Add patient log entry (per patient)
  const addPatientLog = useCallback((patientId, type, vital, message, value, severity) => {
    const newLog = {
      type,      // 'vitals', 'spo2', 'temp', 'critical', 'warning', 'normal'
      vital,     // 'HR', 'SpO2', 'Temp'
      message,
      value,     // e.g., '120 BPM', '95%'
      severity,  // 'critical', 'warning', 'normal'
      time: new Date().toLocaleTimeString()
    };
    setAllPatientLogs(prev => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []).slice(-49), newLog]
    }));
  }, []);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.2;

      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  // ==================== VITALS SIMULATOR ====================
  const generateSimulatedVitals = useCallback((patient) => {
    // Different base vitals per patient condition
    const conditionProfiles = {
      'Cardiac': { baseHR: 95, baseSpo2: 94, baseTemp: 37.2, criticalChance: 0.08 },
      'Trauma': { baseHR: 85, baseSpo2: 96, baseTemp: 36.5, criticalChance: 0.06 },
      'Respiratory': { baseHR: 78, baseSpo2: 91, baseTemp: 37.8, criticalChance: 0.1 },
      'Stroke': { baseHR: 88, baseSpo2: 95, baseTemp: 37.0, criticalChance: 0.07 }
    };

    const profile = conditionProfiles[patient.condition] || conditionProfiles['Cardiac'];
    const { baseHR, baseSpo2, baseTemp, criticalChance } = profile;

    // Add variation and occasional spikes
    const random = Math.random();
    let heartRate, spo2, temperature, status, alerts;

    if (random > (1 - criticalChance)) {
      // Critical scenario
      heartRate = Math.round(baseHR + 40 + Math.random() * 20);
      spo2 = Math.round(baseSpo2 - 8 + Math.random() * 4);
      temperature = baseTemp + 2 + Math.random() * 0.8;
      status = 'critical';
      alerts = ['High Heart Rate', 'Low SpO2'];
    } else if (random > 0.85) {
      // Warning scenario (10% chance)
      heartRate = Math.round(baseHR + 25 + Math.random() * 15);
      spo2 = Math.round(baseSpo2 - 3 + Math.random() * 3);
      temperature = baseTemp + 1 + Math.random() * 0.5;
      status = 'warning';
      alerts = ['Elevated Heart Rate'];
    } else {
      // Normal scenario
      heartRate = Math.round(baseHR + (Math.random() - 0.5) * 20);
      spo2 = Math.round(baseSpo2 + (Math.random() - 0.5) * 4);
      temperature = baseTemp + (Math.random() - 0.5) * 0.6;
      status = 'normal';
      alerts = [];
    }

    return {
      patientId: patient.id,
      patientName: patient.name,
      ambulance: patient.ambulance,
      location: patient.location,
      condition: patient.condition,
      vitals: {
        heartRate: Math.max(50, Math.min(180, heartRate)),
        spo2: Math.max(80, Math.min(100, spo2)),
        temperature: Math.max(35, Math.min(41, temperature))
      },
      status,
      alerts,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Toggle simulator
  const toggleSimulator = useCallback(() => {
    setSimulatorOn(prev => !prev);
  }, []);

  // Select patient handler
  const selectPatient = useCallback((patientId) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      addEvent('info', `🔄 Switched to ${patient.name} (${patient.ambulance})`);
    }
  }, [patients, addEvent]);

  // Simulator effect - handles ALL patients simultaneously
  useEffect(() => {
    if (simulatorOn) {
      addEvent('info', '🎮 Multi-Patient Simulator Started');
      addEvent('info', `📡 Tracking ${patients.length} ambulances`);
      setConnected(true);

      // Initialize history for all patients
      const initialHistories = {};
      const initialData = {};
      patients.forEach(patient => {
        initialHistories[patient.id] = {
          timestamps: [],
          heartRate: [],
          spo2: [],
          temperature: []
        };
        initialData[patient.id] = generateSimulatedVitals(patient);
      });
      setAllPatientsHistory(initialHistories);
      setAllPatientsData(initialData);

      // Track last vitals for each patient
      const lastVitalsMap = {};

      // Start simulation interval - updates ALL patients
      simulatorRef.current = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();

        patients.forEach(patient => {
          const newVitals = generateSimulatedVitals(patient);

          // Update patient data
          setAllPatientsData(prev => ({
            ...prev,
            [patient.id]: newVitals
          }));

          // Update history for this patient
          setAllPatientsHistory(prev => ({
            ...prev,
            [patient.id]: {
              timestamps: [...(prev[patient.id]?.timestamps || []).slice(-59), timestamp],
              heartRate: [...(prev[patient.id]?.heartRate || []).slice(-59), newVitals.vitals.heartRate],
              spo2: [...(prev[patient.id]?.spo2 || []).slice(-59), newVitals.vitals.spo2],
              temperature: [...(prev[patient.id]?.temperature || []).slice(-59), newVitals.vitals.temperature]
            }
          }));

          // Log patient vitals changes
          const hr = newVitals.vitals.heartRate;
          const sp = newVitals.vitals.spo2;
          const temp = newVitals.vitals.temperature;
          const lastVitals = lastVitalsMap[patient.id];

          // Heart Rate logging
          if (hr > 130) {
            addPatientLog(patient.id, 'vitals', 'HR', 'Tachycardia detected', `${hr} BPM`, 'critical');
          } else if (hr > 120) {
            addPatientLog(patient.id, 'vitals', 'HR', 'Elevated heart rate', `${hr} BPM`, 'warning');
          } else if (hr < 60) {
            addPatientLog(patient.id, 'vitals', 'HR', 'Bradycardia detected', `${hr} BPM`, 'warning');
          } else if (!lastVitals || Math.abs(hr - lastVitals.vitals.heartRate) > 15) {
            addPatientLog(patient.id, 'vitals', 'HR', 'Heart rate recorded', `${hr} BPM`, 'normal');
          }

          // SpO2 logging
          if (sp < 90) {
            addPatientLog(patient.id, 'spo2', 'SpO2', 'Critical hypoxemia', `${sp}%`, 'critical');
          } else if (sp < 94) {
            addPatientLog(patient.id, 'spo2', 'SpO2', 'Low oxygen saturation', `${sp}%`, 'warning');
          } else if (!lastVitals || Math.abs(sp - lastVitals.vitals.spo2) > 3) {
            addPatientLog(patient.id, 'spo2', 'SpO2', 'Oxygen level recorded', `${sp}%`, 'normal');
          }

          // Temperature logging
          if (temp > 39) {
            addPatientLog(patient.id, 'temp', 'Temp', 'High fever detected', `${temp.toFixed(1)}°C`, 'critical');
          } else if (temp > 38.5) {
            addPatientLog(patient.id, 'temp', 'Temp', 'Elevated temperature', `${temp.toFixed(1)}°C`, 'warning');
          } else if (temp < 35.5) {
            addPatientLog(patient.id, 'temp', 'Temp', 'Hypothermia warning', `${temp.toFixed(1)}°C`, 'warning');
          }

          lastVitalsMap[patient.id] = newVitals;

          // Log system alerts for selected patient only (to avoid spam)
          if (patient.id === selectedPatientId) {
            if (newVitals.status === 'critical') {
              addEvent('critical', `🚨 ${patient.name}: ${newVitals.alerts.join(', ')}`);
              playAlertSound();
            } else if (newVitals.status === 'warning') {
              addEvent('warning', `⚠️ ${patient.name}: ${newVitals.alerts.join(', ')}`);
            }
          }
        });

        setLastUpdate(timestamp);
        setPacketCount(prev => prev + patients.length);
        setLatency(Math.round(Math.random() * 50 + 10));
      }, 1000); // Update every second

    } else {
      // Stop simulator
      if (simulatorRef.current) {
        clearInterval(simulatorRef.current);
        simulatorRef.current = null;
      }
      addEvent('info', '🎮 Multi-Patient Simulator Stopped');
      setConnected(false);
      setAllPatientsData({});
      setAllPatientsHistory({});
    }

    return () => {
      if (simulatorRef.current) {
        clearInterval(simulatorRef.current);
      }
    };
  }, [simulatorOn, patients, selectedPatientId, generateSimulatedVitals, addEvent, addPatientLog, playAlertSound]);

  // Socket event handlers
  useEffect(() => {
    // Connection events
    socket.on('connect', () => {
      setConnected(true);
      addEvent('info', 'Connected to LifeLink Server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addEvent('warning', 'Disconnected from server');
    });

    // Initial data
    socket.on('initial-data', (data) => {
      console.log('📦 Initial data received:', data);
      if (data.patients && data.patients.length > 0) {
        setPatientData(data.patients[0]);
        setHistory(data.history[data.patients[0].patientId]);
        addEvent('info', 'Received initial patient data');
      }
    });

    // Real-time vitals update
    socket.on('vitals-update', (data) => {
      setPatientData(data.patient);
      setHistory(data.history);
      setLastUpdate(new Date().toLocaleTimeString());
      setPacketCount(prev => prev + 1);

      // Calculate latency
      const serverTime = new Date(data.patient.timestamp).getTime();
      const calculatedLatency = Math.abs(Date.now() - serverTime);
      setLatency(Math.min(calculatedLatency, 999));

      // Log status changes
      if (data.patient.status === 'critical') {
        addEvent('critical', `Critical: ${data.patient.alerts?.join(', ') || 'Check vitals'}`);
      } else if (data.patient.status === 'warning') {
        addEvent('warning', `Warning: ${data.patient.alerts?.join(', ') || 'Elevated vitals'}`);
      }
    });

    // Alert events
    socket.on('patient-alert', (alert) => {
      addEvent(alert.status, alert.alerts?.join(', ') || 'Alert received');

      // Play sound for critical alerts
      if (alert.status === 'critical') {
        playAlertSound();
      }
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial-data');
      socket.off('vitals-update');
      socket.off('patient-alert');
    };
  }, [addEvent, playAlertSound]);

  // Extract status
  const status = patientData?.status || 'normal';

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          patientData={patientData}
        />

        {/* Main Content Area */}
        <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Top Navbar */}
          <Navbar
            connected={connected}
            status={status}
            onMenuToggle={toggleSidebar}
            sidebarOpen={sidebarOpen}
            simulatorOn={simulatorOn}
            onToggleSimulator={toggleSimulator}
            theme={theme}
            onToggleTheme={toggleTheme}
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={selectPatient}
            allPatientsData={allPatientsData}
          />

          {/* Dashboard Content */}
          <main className="main-content">
            <div className="content-wrapper">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      patientData={patientData}
                      history={history}
                      events={events}
                      patientLogs={patientLogs}
                      connected={connected}
                      latency={latency}
                      lastUpdate={lastUpdate}
                      patients={patients}
                      allPatientsData={allPatientsData}
                      selectedPatientId={selectedPatientId}
                      onSelectPatient={selectPatient}
                    />
                  }
                />
                <Route
                  path="/vitals"
                  element={
                    <VitalsMonitor
                      patientData={patientData}
                      history={history}
                    />
                  }
                />
                <Route
                  path="/patient"
                  element={<PatientInfo patientData={patientData} />}
                />
                <Route
                  path="/alerts"
                  element={
                    <Alerts
                      events={events}
                      patientData={patientData}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={
                    <History
                      patientData={patientData}
                      history={history}
                    />
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <Reports
                      patientData={patientData}
                      history={history}
                      events={events}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={<Settings />}
                />
              </Routes>
            </div>

            {/* Footer */}
            <footer className="main-footer">
              <span>🏥 LifeLink Twin - Emergency Health IoT Digital Twin System</span>
              <span className="footer-divider">•</span>
              <span>Last Update: {lastUpdate || '--:--:--'}</span>
            </footer>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
