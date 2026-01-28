/**
 * LifeLink Twin - Edge Processing Service
 * 
 * This service acts as an edge computing layer between the ambulance
 * and the cloud. It performs:
 * 
 * 1. Subscribes to raw vital data from MQTT
 * 2. Filters out noisy spikes (smoothing)
 * 3. Applies emergency detection logic
 * 4. Forwards processed data to cloud topic
 * 
 * Input Topic: lifelink/patient1/vitals
 * Output Topic: lifelink/patient1/processed
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'mqtt://localhost:1883';
const INPUT_TOPIC = 'lifelink/patient1/vitals';
const OUTPUT_TOPIC = 'lifelink/patient1/processed';

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

// Store previous values for noise filtering (moving average)
const history = {
    heartRate: [],
    spo2: [],
    temperature: []
};
const HISTORY_SIZE = 5; // Number of samples for moving average

/**
 * Apply moving average filter to smooth out noisy spikes
 * @param {string} metric - The vital metric name
 * @param {number} value - Current reading value
 * @returns {number} Smoothed value
 */
function smoothValue(metric, value) {
    // Add to history
    history[metric].push(value);

    // Keep only last N values
    if (history[metric].length > HISTORY_SIZE) {
        history[metric].shift();
    }

    // Calculate moving average
    const sum = history[metric].reduce((a, b) => a + b, 0);
    const average = sum / history[metric].length;

    return Math.round(average * 10) / 10; // Round to 1 decimal
}

/**
 * Determine patient status based on vital signs
 * Emergency detection logic:
 * - heartRate > 120 → warning
 * - heartRate > 130 → critical
 * - spo2 < 90 → critical
 * - spo2 < 94 → warning
 * - temperature > 38.5 → warning
 * - temperature > 39 → critical
 * 
 * @param {object} vitals - Smoothed vital signs
 * @returns {object} Status info with level and alerts
 */
function determineStatus(vitals) {
    const alerts = [];
    let status = 'normal';

    // Heart Rate Analysis
    if (vitals.heartRate > 130) {
        status = 'critical';
        alerts.push('Tachycardia: Heart rate critically high');
    } else if (vitals.heartRate > 120) {
        if (status !== 'critical') status = 'warning';
        alerts.push('Elevated heart rate');
    } else if (vitals.heartRate < 50) {
        status = 'critical';
        alerts.push('Bradycardia: Heart rate critically low');
    }

    // SpO2 Analysis
    if (vitals.spo2 < 90) {
        status = 'critical';
        alerts.push('Hypoxemia: Oxygen saturation critically low');
    } else if (vitals.spo2 < 94) {
        if (status !== 'critical') status = 'warning';
        alerts.push('Low oxygen saturation');
    }

    // Temperature Analysis
    if (vitals.temperature > 39) {
        status = 'critical';
        alerts.push('High fever: Temperature critical');
    } else if (vitals.temperature > 38.5) {
        if (status !== 'critical') status = 'warning';
        alerts.push('Fever detected');
    } else if (vitals.temperature < 35) {
        status = 'critical';
        alerts.push('Hypothermia: Temperature critically low');
    }

    return { status, alerts };
}

/**
 * Process incoming vital data
 * @param {object} data - Raw vital data from simulator
 * @returns {object} Processed data with status
 */
function processVitals(data) {
    // Apply smoothing filter
    const smoothedVitals = {
        heartRate: Math.round(smoothValue('heartRate', data.vitals.heartRate)),
        spo2: Math.round(smoothValue('spo2', data.vitals.spo2)),
        temperature: smoothValue('temperature', data.vitals.temperature)
    };

    // Determine status and alerts
    const { status, alerts } = determineStatus(smoothedVitals);

    // Build processed data packet
    return {
        patientId: data.patientId,
        patientName: data.patientName,
        timestamp: data.timestamp,
        processedAt: new Date().toISOString(),
        vitals: smoothedVitals,
        rawVitals: data.vitals, // Include raw for comparison
        status: status,
        alerts: alerts,
        location: data.location
    };
}

// MQTT Connection Handler
client.on('connect', () => {
    console.log('🖥️  Edge Processing Service connected to MQTT broker');
    console.log(`📥 Subscribing to: ${INPUT_TOPIC}`);
    console.log(`📤 Publishing to: ${OUTPUT_TOPIC}`);
    console.log('-------------------------------------------');

    // Subscribe to raw vitals
    client.subscribe(INPUT_TOPIC, (err) => {
        if (err) {
            console.error('❌ Subscribe error:', err);
        } else {
            console.log('✅ Subscribed successfully. Waiting for data...\n');
        }
    });
});

// Message Handler
client.on('message', (topic, message) => {
    try {
        // Parse incoming data
        const rawData = JSON.parse(message.toString());

        // Process the vitals
        const processedData = processVitals(rawData);

        // Publish processed data
        client.publish(OUTPUT_TOPIC, JSON.stringify(processedData));

        // Log with status color
        const statusEmoji = {
            'normal': '🟢',
            'warning': '🟡',
            'critical': '🔴'
        };

        console.log(`[${new Date().toLocaleTimeString()}] Processed vitals:`);
        console.log(`   ${statusEmoji[processedData.status]} Status: ${processedData.status.toUpperCase()}`);
        console.log(`   ❤️  HR: ${processedData.rawVitals.heartRate} → ${processedData.vitals.heartRate} BPM`);
        console.log(`   🫁 SpO2: ${processedData.rawVitals.spo2} → ${processedData.vitals.spo2}%`);
        console.log(`   🌡️  Temp: ${processedData.rawVitals.temperature} → ${processedData.vitals.temperature}°C`);

        if (processedData.alerts.length > 0) {
            console.log(`   ⚠️  Alerts: ${processedData.alerts.join(', ')}`);
        }
        console.log('');

    } catch (error) {
        console.error('❌ Error processing message:', error.message);
    }
});

// Error Handler
client.on('error', (error) => {
    console.error('❌ MQTT Connection Error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down edge service...');
    client.end();
    process.exit();
});
