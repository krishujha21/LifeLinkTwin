# 🏥 LifeLink Twin

**Real-time Emergency Health IoT Digital Twin System**

A hackathon project that simulates patient vitals from an ambulance, processes them using edge intelligence, and displays a live digital twin dashboard at a hospital.

![Architecture](https://img.shields.io/badge/Architecture-IoT%20Digital%20Twin-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │      │                 │
│  🚑 Ambulance   │──────▶│  🖥️ Edge        │──────▶│  ☁️ Cloud       │──────▶│  🏥 Hospital    │
│  Simulator      │ MQTT │  Processing     │ MQTT │  Server         │  WS  │  Dashboard      │
│                 │      │                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘
     vitals/              Filters noise           Express + Socket.io      Real-time charts
     patient1             Adds status             In-memory store          Status indicators
```

## 📁 Project Structure

```
LifeLinkTwin/
├── simulator/          # Vital Data Simulator
│   └── index.js        # Generates fake patient vitals
├── edge/               # Edge Processing Service
│   └── index.js        # Filters data, detects emergencies
├── server/             # Cloud Server
│   └── index.js        # Express + WebSocket server
├── public/             # Digital Twin Dashboard
│   ├── index.html      # Dashboard HTML
│   ├── styles.css      # Modern dark theme styles
│   └── app.js          # Real-time chart logic
├── package.json        # Dependencies
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Mosquitto MQTT Broker** - Local MQTT server

### Install Mosquitto (MQTT Broker)

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**Windows:**
Download from [mosquitto.org](https://mosquitto.org/download/)

### Install & Run

1. **Clone and install dependencies:**
```bash
cd LifeLinkTwin
npm install
```

2. **Start all services (recommended):**
```bash
npm run start:all
```

Or run each service in separate terminals:

```bash
# Terminal 1: Start Cloud Server
npm run start:server

# Terminal 2: Start Edge Processing
npm run start:edge

# Terminal 3: Start Vital Simulator
npm run start:simulator
```

3. **Open Dashboard:**
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Features

### Vital Data Simulator (`/simulator`)
- Generates realistic patient vitals every second
- **Heart Rate:** 60-140 BPM
- **SpO2:** 85-100%
- **Temperature:** 36-40°C
- Publishes to MQTT topic: `lifelink/patient1/vitals`

### Edge Processing Service (`/edge`)
- **Noise Filtering:** Moving average smoothing (5 samples)
- **Emergency Detection:**
  - Heart Rate > 120 → ⚠️ Warning
  - Heart Rate > 130 → 🔴 Critical
  - SpO2 < 94 → ⚠️ Warning
  - SpO2 < 90 → 🔴 Critical
  - Temperature > 38.5°C → ⚠️ Warning
  - Temperature > 39°C → 🔴 Critical
- Publishes to: `lifelink/patient1/processed`

### Cloud Server (`/server`)
- Express.js REST API
- Socket.io real-time WebSocket
- In-memory patient data storage
- API Endpoints:
  - `GET /api/patients` - All patients
  - `GET /api/patient/:id` - Specific patient
  - `GET /api/health` - Server health check

### Digital Twin Dashboard (`/public`)
- **Real-time Heart Rate Chart** (Chart.js)
- **SpO2 Gauge** with color gradient
- **Temperature Indicator**
- **Status Colors:**
  - 🟢 Green = Normal
  - 🟡 Yellow = Warning
  - 🔴 Red = Critical (with animation)
- **Active Alerts Panel**
- **Browser Notifications** for critical alerts
- **Audio Alert** for critical conditions

## 🔧 Configuration

### MQTT Settings
Edit the broker URL in each service file:
```javascript
const MQTT_BROKER = 'mqtt://localhost:1883';
```

### Server Port
Edit in `server/index.js`:
```javascript
const PORT = 3000;
```

### Emergency Thresholds
Edit in `edge/index.js`:
```javascript
// Heart Rate Analysis
if (vitals.heartRate > 130) status = 'critical';
else if (vitals.heartRate > 120) status = 'warning';

// SpO2 Analysis
if (vitals.spo2 < 90) status = 'critical';
else if (vitals.spo2 < 94) status = 'warning';

// Temperature Analysis
if (vitals.temperature > 39) status = 'critical';
else if (vitals.temperature > 38.5) status = 'warning';
```

## 📡 MQTT Topics

| Topic | Publisher | Subscriber | Description |
|-------|-----------|------------|-------------|
| `lifelink/patient1/vitals` | Simulator | Edge | Raw vital signs |
| `lifelink/patient1/processed` | Edge | Server | Processed data with status |

## 🖼️ Dashboard Preview

The dashboard displays:
- Patient identification and location
- Real-time vital signs with visual indicators
- Historical trend chart (60 seconds)
- Active alerts with timestamps
- Connection status indicator

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Messaging:** MQTT (Mosquitto)
- **Real-time:** Socket.io WebSockets
- **Frontend:** HTML5, CSS3, JavaScript
- **Charts:** Chart.js
- **Process Manager:** Concurrently

## 📝 API Reference

### GET /api/patients
Returns all monitored patients.

### GET /api/patient/:id
Returns specific patient data and history.

### GET /api/health
Returns server health status:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T10:00:00.000Z",
  "mqtt": "connected",
  "clients": 1
}
```

## 🎯 Hackathon Notes

- **No database required** - all data stored in memory
- **Lightweight dependencies** - easy to set up
- **Well-commented code** - easy to understand
- **Modular architecture** - easy to extend

## 📄 License

MIT License - Feel free to use for your hackathon!

---

**Built with ❤️ for healthcare innovation**
