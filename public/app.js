/**
 * LifeLink Twin - Dashboard Application
 * 
 * This script handles:
 * 1. WebSocket connection to cloud server
 * 2. Real-time vital sign updates
 * 3. Chart rendering with Chart.js
 * 4. Status indicators and alerts
 */

// Initialize Socket.io connection
const socket = io();

// Chart instances
let heartRateChart = null;
let fullHeartRateChart = null;

// DOM Elements
const elements = {
    connectionStatus: document.getElementById('connectionStatus'),
    currentTime: document.getElementById('currentTime'),
    patientName: document.getElementById('patientName'),
    patientId: document.getElementById('patientId'),
    patientStatus: document.getElementById('patientStatus'),
    patientLocation: document.getElementById('patientLocation'),
    heartRateValue: document.getElementById('heartRateValue'),
    spo2Value: document.getElementById('spo2Value'),
    spo2Gauge: document.getElementById('spo2Gauge'),
    temperatureValue: document.getElementById('temperatureValue'),
    tempFill: document.getElementById('tempFill'),
    alertsContainer: document.getElementById('alertsContainer'),
    lastUpdate: document.getElementById('lastUpdate')
};

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateClock();
    setInterval(updateClock, 1000);
});

/**
 * Initialize Chart.js charts
 */
function initCharts() {
    // Mini heart rate chart
    const ctx = document.getElementById('heartRateChart').getContext('2d');
    heartRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: {
                    display: false,
                    min: 40,
                    max: 160
                }
            }
        }
    });

    // Full heart rate trend chart
    const fullCtx = document.getElementById('fullHeartRateChart').getContext('2d');
    fullHeartRateChart = new Chart(fullCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Heart Rate',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'SpO2',
                    data: [],
                    borderColor: '#4dabf7',
                    backgroundColor: 'rgba(77, 171, 247, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: { color: '#f0f6fc' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#8b949e', maxTicksLimit: 10 },
                    grid: { color: 'rgba(139, 148, 158, 0.1)' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 40,
                    max: 160,
                    title: {
                        display: true,
                        text: 'Heart Rate (BPM)',
                        color: '#ff6b6b'
                    },
                    ticks: { color: '#ff6b6b' },
                    grid: { color: 'rgba(139, 148, 158, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 80,
                    max: 100,
                    title: {
                        display: true,
                        text: 'SpO2 (%)',
                        color: '#4dabf7'
                    },
                    ticks: { color: '#4dabf7' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/**
 * Update clock display
 */
function updateClock() {
    elements.currentTime.textContent = new Date().toLocaleTimeString();
}

/**
 * Update vital displays with new data
 * @param {object} data - Vital data from server
 */
function updateVitals(data) {
    const { patient, history } = data;

    // Update patient info
    elements.patientName.textContent = patient.patientName;
    elements.patientId.textContent = `Patient ID: ${patient.patientId}`;

    // Update location
    if (patient.location) {
        elements.patientLocation.textContent =
            `${patient.location.lat.toFixed(4)}, ${patient.location.lng.toFixed(4)} (Ambulance)`;
    }

    // Update vital values with animation
    animateValue(elements.heartRateValue, patient.vitals.heartRate);
    animateValue(elements.spo2Value, patient.vitals.spo2);
    elements.temperatureValue.textContent = patient.vitals.temperature.toFixed(1);

    // Update SpO2 gauge (85-100% range)
    const spo2Percent = ((patient.vitals.spo2 - 85) / 15) * 100;
    elements.spo2Gauge.style.width = `${Math.max(0, Math.min(100, spo2Percent))}%`;

    // Update temperature indicator (35-40°C range)
    const tempPercent = ((patient.vitals.temperature - 35) / 5) * 100;
    elements.tempFill.style.left = `${Math.max(0, Math.min(100, tempPercent))}%`;

    // Update status badge
    updateStatusBadge(patient.status);

    // Update alerts
    updateAlerts(patient.alerts, patient.status);

    // Update charts
    if (history) {
        updateCharts(history);
    }

    // Update last update time
    elements.lastUpdate.textContent = new Date().toLocaleTimeString();

    // Add status-based styling to vital cards
    updateVitalCardStyles(patient);
}

/**
 * Animate number changes
 */
function animateValue(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue !== newValue) {
        element.textContent = newValue;
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Update status badge
 * @param {string} status - normal | warning | critical
 */
function updateStatusBadge(status) {
    const badge = elements.patientStatus.querySelector('.status-badge');
    badge.className = `status-badge ${status}`;
    badge.textContent = status.toUpperCase();
}

/**
 * Update alerts display
 * @param {array} alerts - Array of alert messages
 * @param {string} status - Current status
 */
function updateAlerts(alerts, status) {
    if (!alerts || alerts.length === 0) {
        elements.alertsContainer.innerHTML = '<p class="no-alerts">No active alerts</p>';
        return;
    }

    const alertsHtml = alerts.map(alert => `
        <div class="alert-item ${status}">
            <span class="alert-icon">${status === 'critical' ? '🚨' : '⚠️'}</span>
            <div class="alert-content">
                <div class="alert-message">${alert}</div>
                <div class="alert-time">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    `).join('');

    elements.alertsContainer.innerHTML = alertsHtml;
}

/**
 * Update charts with history data
 * @param {object} history - Historical vital data
 */
function updateCharts(history) {
    // Update mini heart rate chart
    heartRateChart.data.labels = history.timestamps.slice(-20);
    heartRateChart.data.datasets[0].data = history.heartRate.slice(-20);
    heartRateChart.update('none');

    // Update full chart
    fullHeartRateChart.data.labels = history.timestamps;
    fullHeartRateChart.data.datasets[0].data = history.heartRate;
    fullHeartRateChart.data.datasets[1].data = history.spo2;
    fullHeartRateChart.update('none');
}

/**
 * Update vital card styles based on patient status
 * @param {object} patient - Patient data
 */
function updateVitalCardStyles(patient) {
    const heartCard = document.querySelector('.vital-card.heart-rate');
    const spo2Card = document.querySelector('.vital-card.spo2');
    const tempCard = document.querySelector('.vital-card.temperature');

    // Reset classes
    [heartCard, spo2Card, tempCard].forEach(card => {
        card.classList.remove('status-warning', 'status-critical');
    });

    // Add warning/critical styles based on specific vital
    if (patient.vitals.heartRate > 120) {
        heartCard.classList.add(patient.vitals.heartRate > 130 ? 'status-critical' : 'status-warning');
    }

    if (patient.vitals.spo2 < 94) {
        spo2Card.classList.add(patient.vitals.spo2 < 90 ? 'status-critical' : 'status-warning');
    }

    if (patient.vitals.temperature > 38.5) {
        tempCard.classList.add(patient.vitals.temperature > 39 ? 'status-critical' : 'status-warning');
    }
}

// =====================
// Socket.io Event Handlers
// =====================

// Connection established
socket.on('connect', () => {
    console.log('✅ Connected to server');
    elements.connectionStatus.className = 'connection-status connected';
    elements.connectionStatus.querySelector('.status-text').textContent = 'Connected';
});

// Connection lost
socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    elements.connectionStatus.className = 'connection-status disconnected';
    elements.connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
});

// Initial data on connection
socket.on('initial-data', (data) => {
    console.log('📦 Received initial data:', data);
    if (data.patients && data.patients.length > 0) {
        updateVitals({
            patient: data.patients[0],
            history: data.history[data.patients[0].patientId]
        });
    }
});

// Real-time vital updates
socket.on('vitals-update', (data) => {
    updateVitals(data);
});

// Critical alert notifications
socket.on('patient-alert', (alert) => {
    console.log('🚨 Alert:', alert);

    // Play alert sound for critical
    if (alert.status === 'critical') {
        playAlertSound();
    }

    // Show browser notification if permitted
    showNotification(alert);
});

/**
 * Play alert sound for critical conditions
 */
function playAlertSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
        console.log('Audio not supported');
    }
}

/**
 * Show browser notification
 * @param {object} alert - Alert data
 */
function showNotification(alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 LifeLink Alert: ${alert.patientName}`, {
            body: alert.alerts.join('\n'),
            icon: '🏥',
            tag: 'lifelink-alert'
        });
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

console.log('🏥 LifeLink Twin Dashboard initialized');
