/**
 * LifeLink Twin - Vital Data Simulator
 * 
 * This script simulates patient vitals from an ambulance.
 * It publishes fake vital signs every second to an MQTT broker.
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

/**
 * Generate random number within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number in range
 */
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float within a range (for temperature)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float with 1 decimal
 */
function randomFloat(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Generate simulated vital signs
 * @returns {object} Vital signs data
 */
function generateVitals() {
    return {
        patientId: patientId,
        patientName: patientName,
        timestamp: new Date().toISOString(),
        vitals: {
            heartRate: randomInRange(60, 140),      // BPM (60-140)
            spo2: randomInRange(85, 100),           // Oxygen saturation % (85-100)
            temperature: randomFloat(36.0, 40.0)    // Celsius (36-40)
        },
        location: {
            lat: 37.7749 + (Math.random() - 0.5) * 0.01,  // Simulated GPS
            lng: -122.4194 + (Math.random() - 0.5) * 0.01
        }
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
