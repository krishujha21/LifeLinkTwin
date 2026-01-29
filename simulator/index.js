/**
 * LifeLink Twin - Realistic Vital Data Simulator
 * 
 * This script simulates patient vitals from an ambulance.
 * It publishes realistic vital signs with smooth transitions
 * and medical scenarios to an MQTT broker.
 * 
 * Topics: lifelink/patient1/vitals
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'mqtt://localhost:1883';
const TOPIC = 'lifelink/patient1/vitals';
const PUBLISH_INTERVAL = 1000; // 1 second

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

// Patient metadata
const patientId = 'patient1';
const patientName = 'John Doe';

// ==================== REALISTIC VITAL SIMULATOR ====================

// Current vital state (starts with normal baseline)
let currentVitals = {
    heartRate: 75,      // Normal resting HR
    spo2: 98,           // Normal SpO2
    temperature: 36.8   // Normal body temp
};

// Target vitals (what we're trending towards)
let targetVitals = { ...currentVitals };

// Medical scenarios with realistic patterns
const scenarios = [
    {
        name: 'Normal/Stable',
        duration: 30,  // seconds
        targets: { heartRate: 72, spo2: 98, temperature: 36.6 },
        variability: { heartRate: 3, spo2: 1, temperature: 0.1 }
    },
    {
        name: 'Mild Anxiety/Stress',
        duration: 20,
        targets: { heartRate: 95, spo2: 97, temperature: 36.9 },
        variability: { heartRate: 5, spo2: 1, temperature: 0.1 }
    },
    {
        name: 'Physical Exertion',
        duration: 15,
        targets: { heartRate: 110, spo2: 96, temperature: 37.2 },
        variability: { heartRate: 8, spo2: 2, temperature: 0.2 }
    },
    {
        name: 'Mild Hypoxia',
        duration: 20,
        targets: { heartRate: 100, spo2: 92, temperature: 37.0 },
        variability: { heartRate: 6, spo2: 2, temperature: 0.1 }
    },
    {
        name: 'Fever Episode',
        duration: 25,
        targets: { heartRate: 105, spo2: 96, temperature: 38.5 },
        variability: { heartRate: 5, spo2: 1, temperature: 0.3 }
    },
    {
        name: 'Recovery Phase',
        duration: 30,
        targets: { heartRate: 80, spo2: 98, temperature: 37.0 },
        variability: { heartRate: 4, spo2: 1, temperature: 0.1 }
    },
    {
        name: 'Critical - Tachycardia',
        duration: 15,
        targets: { heartRate: 135, spo2: 93, temperature: 37.5 },
        variability: { heartRate: 10, spo2: 2, temperature: 0.2 }
    },
    {
        name: 'Critical - Hypoxemia',
        duration: 15,
        targets: { heartRate: 115, spo2: 88, temperature: 37.2 },
        variability: { heartRate: 8, spo2: 3, temperature: 0.2 }
    }
];

let currentScenario = scenarios[0];
let scenarioTimer = 0;
let scenarioIndex = 0;

/**
 * Smoothly interpolate towards target value
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} speed - Interpolation speed (0-1)
 * @returns {number} New interpolated value
 */
function lerp(current, target, speed = 0.1) {
    return current + (target - current) * speed;
}

/**
 * Add realistic variability (small natural fluctuations)
 * @param {number} value - Base value
 * @param {number} range - Variability range
 * @returns {number} Value with natural variation
 */
function addVariability(value, range) {
    // Use sine wave + small random for natural feeling
    const time = Date.now() / 1000;
    const sineVariation = Math.sin(time * 0.5) * (range * 0.3);
    const randomVariation = (Math.random() - 0.5) * range * 0.7;
    return value + sineVariation + randomVariation;
}

/**
 * Clamp value within min/max bounds
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate realistic simulated vital signs
 * @returns {object} Vital signs data
 */
function generateVitals() {
    // Update scenario timer
    scenarioTimer++;

    // Check if we need to switch scenarios
    if (scenarioTimer >= currentScenario.duration) {
        scenarioTimer = 0;
        // 70% chance to go to normal/recovery, 30% chance for other scenarios
        if (Math.random() < 0.7) {
            scenarioIndex = Math.random() < 0.5 ? 0 : 5; // Normal or Recovery
        } else {
            scenarioIndex = Math.floor(Math.random() * scenarios.length);
        }
        currentScenario = scenarios[scenarioIndex];
        targetVitals = { ...currentScenario.targets };
        console.log(`📋 Scenario: ${currentScenario.name}`);
    }

    // Smoothly interpolate current vitals towards target
    currentVitals.heartRate = lerp(currentVitals.heartRate, targetVitals.heartRate, 0.08);
    currentVitals.spo2 = lerp(currentVitals.spo2, targetVitals.spo2, 0.05);
    currentVitals.temperature = lerp(currentVitals.temperature, targetVitals.temperature, 0.03);

    // Add natural variability
    const heartRate = Math.round(clamp(
        addVariability(currentVitals.heartRate, currentScenario.variability.heartRate),
        40, 180
    ));

    const spo2 = Math.round(clamp(
        addVariability(currentVitals.spo2, currentScenario.variability.spo2),
        70, 100
    ));

    const temperature = Math.round(clamp(
        addVariability(currentVitals.temperature, currentScenario.variability.temperature),
        35.0, 42.0
    ) * 10) / 10;

    return {
        patientId: patientId,
        patientName: patientName,
        timestamp: new Date().toISOString(),
        vitals: {
            heartRate: heartRate,
            spo2: spo2,
            temperature: temperature
        },
        location: {
            // Smooth GPS movement (ambulance moving towards hospital)
            lat: 28.6139 + Math.sin(Date.now() / 10000) * 0.005,
            lng: 77.2090 + Math.cos(Date.now() / 10000) * 0.005
        },
        scenario: currentScenario.name
    };
}

// MQTT Connection Handler
client.on('connect', () => {
    console.log('🚑 Vital Simulator connected to MQTT broker');
    console.log(`📡 Publishing to topic: ${TOPIC}`);
    console.log('-------------------------------------------');

    // Publish vitals every second
    setInterval(() => {
        const vitals = generateVitals();
        const payload = JSON.stringify(vitals);

        client.publish(TOPIC, payload);

        // Log the published data
        console.log(`[${new Date().toLocaleTimeString()}] Published vitals:`);
        console.log(`   ❤️  Heart Rate: ${vitals.vitals.heartRate} BPM`);
        console.log(`   🫁 SpO2: ${vitals.vitals.spo2}%`);
        console.log(`   🌡️  Temp: ${vitals.vitals.temperature}°C`);
        console.log('');
    }, PUBLISH_INTERVAL);
});

// Error Handler
client.on('error', (error) => {
    console.error('❌ MQTT Connection Error:', error.message);
    console.log('💡 Make sure Mosquitto MQTT broker is running!');
    console.log('   Install: brew install mosquitto');
    console.log('   Start: brew services start mosquitto');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down simulator...');
    client.end();
    process.exit();
});
