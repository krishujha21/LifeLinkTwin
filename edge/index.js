/**
 * LifeLink Twin - Edge Processing Service
 */

const mqtt = require('mqtt');
const https = require('https');

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const INPUT_TOPIC = process.env.MQTT_TOPIC_VITALS || 'lifelink/llt2026/user/vitals';
const OUTPUT_TOPIC = process.env.MQTT_TOPIC_PROCESSED || 'lifelink/llt2026/user/processed';

const client = mqtt.connect(MQTT_BROKER);

const history = { heartRate: [], spo2: [], temperature: [] };
const HISTORY_SIZE = 5;
let lastGroqCall = 0;

/**
 * Moving average filter
 */
function smoothValue(metric, value) {
    history[metric].push(value);
    if (history[metric].length > HISTORY_SIZE) history[metric].shift();
    const sum = history[metric].reduce((a, b) => a + b, 0);
    return Math.round((sum / history[metric].length) * 10) / 10;
}

/**
 * Rule-based risk score 0-100
 */
function getRiskScore(vitals) {
    let score = 0;
    if (vitals.heartRate > 130) score += 40;
    else if (vitals.heartRate > 120) score += 25;
    else if (vitals.heartRate < 50) score += 40;

    if (vitals.spo2 < 90) score += 40;
    else if (vitals.spo2 < 94) score += 25;

    if (vitals.temperature > 39) score += 20;
    else if (vitals.temperature > 38.5) score += 10;
    else if (vitals.temperature < 35) score += 20;

    return Math.min(100, score);
}

/**
 * Determine status and alerts
 */
function determineStatus(vitals) {
    const alerts = [];
    let status = 'normal';

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

    if (vitals.spo2 < 90) {
        status = 'critical';
        alerts.push('Hypoxemia: Oxygen saturation critically low');
    } else if (vitals.spo2 < 94) {
        if (status !== 'critical') status = 'warning';
        alerts.push('Low oxygen saturation');
    }

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
 * Groq AI clinical assessment
 * Throttled to 1 call per 15 seconds
 */
async function getAIAssessment(vitals, status) {
    if (!process.env.GROQ_API_KEY) return null;
    if (status === 'normal') return null;
    if (Date.now() - lastGroqCall < 15000) return null;
    lastGroqCall = Date.now();

    const prompt = `Patient vitals — HR: ${vitals.heartRate}bpm, SpO2: ${vitals.spo2}%, Temp: ${vitals.temperature}°C. Status: ${status}. Write a 2-sentence urgent clinical assessment for the receiving hospital doctor. Be specific.`;

    const body = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120
    });

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const text = parsed.choices?.[0]?.message?.content;
                    console.log(`🤖 AI Assessment: ${text}`);
                    resolve(text || null);
                } catch { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.setTimeout(5000, () => { req.destroy(); resolve(null); });
        req.write(body);
        req.end();
    });
}

/**
 * Process incoming vital data
 */
async function processVitals(data) {
    const smoothedVitals = {
        heartRate: Math.round(smoothValue('heartRate', data.vitals.heartRate)),
        spo2: Math.round(smoothValue('spo2', data.vitals.spo2)),
        temperature: smoothValue('temperature', data.vitals.temperature)
    };

    const { status, alerts } = determineStatus(smoothedVitals);
    const riskScore = getRiskScore(smoothedVitals);
    const aiAssessment = await getAIAssessment(smoothedVitals, status);

    return {
        patientId: data.patientId,
        patientName: data.patientName,
        timestamp: data.timestamp,
        processedAt: new Date().toISOString(),
        vitals: smoothedVitals,
        rawVitals: data.vitals,
        status,
        alerts,
        riskScore,
        aiAssessment: aiAssessment || 'Monitoring vitals — all parameters being tracked.',
        location: data.location
    };
}

// MQTT Connection
client.on('connect', () => {
    console.log('🖥️  Edge Processing Service connected');
    console.log(`📥 Input:  ${INPUT_TOPIC}`);
    console.log(`📤 Output: ${OUTPUT_TOPIC}`);
    console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? '✅ Enabled' : '❌ No API key'}`);
    console.log('-------------------------------------------');

    client.subscribe(INPUT_TOPIC, (err) => {
        if (err) console.error('❌ Subscribe error:', err);
        else console.log('✅ Subscribed. Waiting for data...\n');
    });
});

// Message Handler — async
client.on('message', async (topic, message) => {
    try {
        const rawData = JSON.parse(message.toString());
        const processedData = await processVitals(rawData);
        client.publish(OUTPUT_TOPIC, JSON.stringify(processedData));

        const emoji = { normal: '🟢', warning: '🟡', critical: '🔴' };
        console.log(`[${new Date().toLocaleTimeString()}] ${emoji[processedData.status]} ${processedData.status.toUpperCase()} | Risk: ${processedData.riskScore}% | HR: ${processedData.vitals.heartRate} | SpO2: ${processedData.vitals.spo2} | Temp: ${processedData.vitals.temperature}`);
        if (processedData.alerts.length > 0) {
            console.log(`   ⚠️  ${processedData.alerts.join(', ')}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
});

client.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.end();
    process.exit();
});