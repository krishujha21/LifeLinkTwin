/**
 * LifeLink Twin - Socket.io Connection
 * 
 * Centralized socket connection for real-time communication
 * with the backend cloud server.
 */

import { io } from 'socket.io-client';

// Backend server URL
const SOCKET_URL = 'http://localhost:3000';

// Create socket connection
export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Connection event listeners for debugging
socket.on('connect', () => {
    console.log('✅ Connected to LifeLink Server');
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.log('⚠️ Connection error:', error.message);
});

export default socket;
