import io from 'socket.io-client';
import { store } from '../store';
import { 
  updateRealTimeData, 
  updateDeviceStatus, 
  setConnectionStatus 
} from '../store/slices/devicesSlice';
import { 
  updateSystemStatus, 
  updateSystemMetrics,
  updateServiceHealth 
} from '../store/slices/systemSlice';
import { 
  addNotification, 
  updateLastDataUpdate 
} from '../store/slices/uiSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.subscribedDevices = new Set();
    this.heartbeatInterval = null;
    
    // Get WebSocket URL from environment or use default
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3003';
    
    console.log('🔌 WebSocket Service initialized with URL:', this.wsUrl);
  }

  connect() {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      console.log('⚠️ WebSocket already connecting or connected');
      return;
    }

    this.isConnecting = true;
    store.dispatch(setConnectionStatus('connecting'));
    
    console.log('🔌 Connecting to WebSocket:', this.wsUrl);
    
    this.socket = io(this.wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      store.dispatch(setConnectionStatus('connected'));
      store.dispatch(addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time data connection established',
        autoClose: 3000
      }));
      
      // Subscribe to all device updates
      this.subscribeToAllDevices();
      
      // Start heartbeat
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnecting = false;
      
      store.dispatch(setConnectionStatus('disconnected'));
      store.dispatch(addNotification({
        type: 'warning',
        title: 'Disconnected',
        message: 'Real-time connection lost. Attempting to reconnect...',
        autoClose: 5000
      }));
      
      // Clear heartbeat
      this.stopHeartbeat();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      store.dispatch(setConnectionStatus('disconnected'));
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: 'Unable to establish real-time connection. Please check if the server is running.',
          autoClose: false
        }));
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      store.dispatch(addNotification({
        type: 'success',
        title: 'Reconnected',
        message: 'Real-time connection restored',
        autoClose: 3000
      }));
    });

    // Data events
    this.socket.on('sensor-data', (data) => {
      console.log('📊 Received sensor data:', data);
      
      store.dispatch(updateRealTimeData({
        deviceId: data.deviceId,
        data: {
          value: data.value,
          unit: data.unit,
          status: data.status || 'normal',
          timestamp: data.timestamp,
          location: data.location
        }
      }));
      
      store.dispatch(updateLastDataUpdate());
    });

    this.socket.on('device-status', (data) => {
      console.log('🔧 Device status update:', data);
      
      store.dispatch(updateDeviceStatus({
        deviceId: data.deviceId,
        status: data.status,
      }));
      
      // Add notification for offline devices
      if (data.status === 'offline') {
        store.dispatch(addNotification({
          type: 'warning',
          title: 'Device Offline',
          message: `Device ${data.deviceId} has gone offline`,
          autoClose: 5000
        }));
      }
    });

    // Alert events
    this.socket.on('alert-triggered', (data) => {
      console.log('🚨 Alert triggered:', data);
      
      store.dispatch(addNotification({
        type: data.severity === 'critical' ? 'error' : 'warning',
        title: 'Alert Triggered',
        message: `${data.deviceId}: ${data.message}`,
        autoClose: data.severity === 'critical' ? false : 10000,
        alertId: data.alertId
      }));
    });

    this.socket.on('alert-resolved', (data) => {
      console.log('✅ Alert resolved:', data);
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'Alert Resolved',
        message: `${data.deviceId}: Alert condition cleared`,
        autoClose: 5000
      }));
    });

    // System events
    this.socket.on('system-status', (data) => {
      console.log('⚙️ System status update:', data);
      
      store.dispatch(updateSystemStatus({
        status: data.status,
        timestamp: data.timestamp
      }));
      
      if (data.metrics) {
        store.dispatch(updateSystemMetrics(data.metrics));
      }
    });

    this.socket.on('service-health', (data) => {
      console.log('🔍 Service health update:', data);
      
      store.dispatch(updateServiceHealth({
        serviceName: data.serviceName,
        status: data.status,
        responseTime: data.responseTime
      }));
    });

    // Connection health events
    this.socket.on('pong', () => {
      console.log('💓 WebSocket heartbeat received');
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      
      store.dispatch(addNotification({
        type: 'error',
        title: 'WebSocket Error',
        message: error.message || 'An unknown error occurred',
        autoClose: 5000
      }));
    });
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket');
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.subscribedDevices.clear();
    
    store.dispatch(setConnectionStatus('disconnected'));
  }

  // Device subscription methods
  subscribeToAllDevices() {
    if (this.socket && this.socket.connected) {
      console.log('📡 Subscribing to all device updates');
      this.socket.emit('subscribe-all-devices');
    }
  }

  subscribeToDevice(deviceId) {
    if (this.socket && this.socket.connected) {
      console.log(`📡 Subscribing to device: ${deviceId}`);
      this.socket.emit('subscribe-device', { deviceId });
      this.subscribedDevices.add(deviceId);
    }
  }

  unsubscribeFromDevice(deviceId) {
    if (this.socket && this.socket.connected) {
      console.log(`📡 Unsubscribing from device: ${deviceId}`);
      this.socket.emit('unsubscribe-device', { deviceId });
      this.subscribedDevices.delete(deviceId);
    }
  }

  subscribeToAlerts() {
    if (this.socket && this.socket.connected) {
      console.log('🚨 Subscribing to alert notifications');
      this.socket.emit('subscribe-alerts');
    }
  }

  subscribeToSystem() {
    if (this.socket && this.socket.connected) {
      console.log('⚙️ Subscribing to system status');
      this.socket.emit('subscribe-system');
    }
  }

  // Heartbeat for connection monitoring
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.connected;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    if (this.isConnecting) return 'connecting';
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  // Manual reconnect
  reconnect() {
    console.log('🔄 Manual WebSocket reconnect requested');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Send custom events (for future features)
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event - WebSocket not connected:', event);
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
