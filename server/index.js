/**
 * LifeLink Twin - Cloud Server
 * 
 * This Express server acts as the cloud backend:
 * 
 * 1. Subscribes to processed MQTT data from edge
 * 2. Stores latest patient data in memory
 * 3. Serves the static dashboard files
 * 4. Sends real-time updates via WebSocket (Socket.io)
 * 
 * MQTT Topic: lifelink/patient1/processed
 * WebSocket Events: 'vitals-update', 'patient-status'
 */

// Load environment variables from server/.env
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Import authentication module
const {
    createDefaultUsers,
    authenticateUser,
    registerUser,
    authMiddleware,
} = require('./auth');

// Configuration
const PORT = process.env.PORT || 3000;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'lifelink/llt2026/user/processed';
const MQTT_ENABLED = process.env.MQTT_ENABLED !== 'false'; // set MQTT_ENABLED=false on Render to use WebSocket-only mode

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time WebSocket communication
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://lifelinktwin.vercel.app',
            /\.vercel\.app$/  // Allow any Vercel preview deployments
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// In-memory storage for patient data
// In production, this would be a database
const patientData = new Map();

// History for charts (last 60 data points = ~1 minute)
const vitalHistory = {
    patient1: {
        timestamps: [],
        heartRate: [],
        spo2: [],
        temperature: []
    }
};
const MAX_HISTORY = 60;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS middleware for dashboard
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://lifelinktwin.vercel.app'
    ];
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'lifelink-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true on Render (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // required for cross-origin cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize default users
createDefaultUsers();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ==================== Authentication Routes ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    const result = await authenticateUser(username, password);

    if (result.success) {
        // Store user in session
        req.session.user = result.user;
        req.session.token = result.token;
        req.session.loginTime = new Date().toISOString();

        // Set token in cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true on Render (HTTPS)
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // required for cross-origin cookies
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log(`🔐 User logged in: ${username} (${result.user.role})`);
    }

    res.json(result);
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    const result = await registerUser(req.body);

    if (result.success) {
        console.log(`👤 New user registered: ${req.body.username}`);
    }

    res.json(result);
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
    });
    res.clearCookie('token');
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        session: {
            loginTime: req.session?.loginTime,
            active: !!req.session?.user
        }
    });
});

// Get session info
app.get('/api/auth/session', (req, res) => {
    if (req.session?.user) {
        res.json({
            success: true,
            active: true,
            user: req.session.user,
            loginTime: req.session.loginTime
        });
    } else {
        res.json({
            success: false,
            active: false,
            message: 'No active session'
        });
    }
});

// ==================== Protected API Routes ====================

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// REST API endpoint to get current patient data
app.get('/api/patient/:id', authMiddleware, (req, res) => {
    const patientId = req.params.id;
    const data = patientData.get(patientId);

    if (data) {
        res.json({
            success: true,
            data: data,
            history: vitalHistory[patientId] || null
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Patient not found'
        });
    }
});

// REST API endpoint to get all patients
app.get('/api/patients', authMiddleware, (req, res) => {
    const patients = Array.from(patientData.values());
    res.json({
        success: true,
        count: patients.length,
        patients: patients
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mqtt: mqttClient ? (mqttClient.connected ? 'connected' : 'disconnected') : 'disabled',
        clients: io.engine.clientsCount
    });
});

// ==================== MQTT (optional) ====================
let mqttClient = null;

if (MQTT_ENABLED) {
    try {
        mqttClient = mqtt.connect(MQTT_BROKER, {
            reconnectPeriod: 0,      // disable auto-reconnect — we handle it manually
            connectTimeout: 5000,
        });

        mqttClient.on('connect', () => {
            console.log('🌐 Cloud Server connected to MQTT broker');
            console.log(`📥 Subscribing to: ${MQTT_TOPIC}`);
            mqttClient.subscribe(MQTT_TOPIC, (err) => {
                if (err) console.error('❌ MQTT Subscribe error:', err);
                else console.log('✅ MQTT subscription active');
            });
        });

        mqttClient.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                patientData.set(data.patientId, data);
                updateHistory(data);

                // Flat WebSocket payload matching dashboard contract
                const wsPayload = {
                    patientId:    data.patientId,
                    patientName:  data.patientName,
                    heartRate:    data.vitals?.heartRate,
                    spo2:         data.vitals?.spo2,
                    temperature:  data.vitals?.temperature,
                    bloodPressure: data.vitals?.bloodPressure || null,
                    status:       data.status,
                    riskScore:    data.riskScore ?? null,
                    aiAssessment: data.aiAssessment || null,
                    alerts:       data.alerts || [],
                    location:     data.location || null,
                    timestamp:    data.timestamp,
                    // Keep nested vitals + history for charts
                    vitals:       data.vitals,
                    history:      vitalHistory[data.patientId] || null
                };

                io.emit('vitals-update', { patient: wsPayload, history: vitalHistory[data.patientId] });

                if (data.status !== 'normal') {
                    io.emit('patient-alert', {
                        patientId:    data.patientId,
                        patientName:  data.patientName,
                        status:       data.status,
                        riskScore:    data.riskScore ?? null,
                        alerts:       data.alerts,
                        aiAssessment: data.aiAssessment || null,
                        timestamp:    data.timestamp
                    });
                }

                const statusEmoji = { normal: '🟢', warning: '🟡', critical: '🔴' };
                console.log(`[${new Date().toLocaleTimeString()}] ${statusEmoji[data.status] || '⚪'} ${data.patientId}: HR=${data.vitals?.heartRate} SpO2=${data.vitals?.spo2}% Temp=${data.vitals?.temperature}°C Risk=${data.riskScore ?? '--'}%`);
            } catch (error) {
                console.error('❌ Error processing MQTT message:', error.message);
            }
        });

        mqttClient.on('error', (error) => {
            // Log once and stop — prevents log flooding on Render
            console.warn(`⚠️  MQTT unavailable (${error.code || error.message}). Running in WebSocket-only mode.`);
            mqttClient.end(true); // force close, no reconnect
            mqttClient = null;
        });

    } catch (e) {
        console.warn('⚠️  MQTT init failed:', e.message);
        mqttClient = null;
    }
} else {
    console.log('ℹ️  MQTT disabled via MQTT_ENABLED=false env var. Running in WebSocket-only mode.');
}

/**
 * Update vital history for charts
 * @param {object} data - Processed vital data
 */
function updateHistory(data) {
    const patientId = data.patientId;

    // Initialize if not exists
    if (!vitalHistory[patientId]) {
        vitalHistory[patientId] = {
            timestamps: [],
            heartRate: [],
            spo2: [],
            temperature: []
        };
    }

    const history = vitalHistory[patientId];

    // Add new data point
    history.timestamps.push(new Date(data.timestamp).toLocaleTimeString());
    history.heartRate.push(data.vitals.heartRate);
    history.spo2.push(data.vitals.spo2);
    history.temperature.push(data.vitals.temperature);

    // Keep only last MAX_HISTORY points
    if (history.timestamps.length > MAX_HISTORY) {
        history.timestamps.shift();
        history.heartRate.shift();
        history.spo2.shift();
        history.temperature.shift();
    }
}

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send current data to newly connected client
    const patients = Array.from(patientData.values());
    if (patients.length > 0) {
        socket.emit('initial-data', {
            patients: patients,
            history: vitalHistory
        });
    }

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    // Handle client requesting specific patient data
    socket.on('subscribe-patient', (patientId) => {
        console.log(`📡 Client ${socket.id} subscribed to ${patientId}`);
        socket.join(patientId);
    });
});

// MQTT error handler (legacy - now handled inside the if block above)

// Start server
server.listen(PORT, () => {
    console.log('===========================================');
    console.log('   🏥 LifeLink Twin Cloud Server');
    console.log('===========================================');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log('===========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    if (mqttClient) mqttClient.end();
    io.close();
    server.close();
    process.exit();
});
