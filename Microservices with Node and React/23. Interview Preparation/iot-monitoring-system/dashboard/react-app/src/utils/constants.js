// Device configuration constants
export const DEVICE_IDS = [
  'device-001',
  'device-002',
  'device-003',
  'device-004',
  'device-005'
];

export const DEVICE_TYPES = {
  'device-001': 'temperature',
  'device-002': 'pressure',
  'device-003': 'vibration',
  'device-004': 'production',
  'device-005': 'quality'
};

export const DEVICE_NAMES = {
  'device-001': 'Temperature Sensor',
  'device-002': 'Pressure Sensor',
  'device-003': 'Vibration Sensor',
  'device-004': 'Production Counter',
  'device-005': 'Quality Sensor'
};

export const DEVICE_UNITS = {
  'device-001': '°C',
  'device-002': 'PSI',
  'device-003': 'Hz',
  'device-004': 'units/hour',
  'device-005': '%'
};

export const DEVICE_LOCATIONS = {
  'device-001': 'Assembly Line 1',
  'device-002': 'Hydraulic Station',
  'device-003': 'Motor Housing',
  'device-004': 'Output Conveyor',
  'device-005': 'Quality Control'
};

// Status definitions and colors
export const STATUS_TYPES = {
  NORMAL: 'normal',
  WARNING_HIGH: 'warning_high',
  WARNING_LOW: 'warning_low',
  CRITICAL_HIGH: 'critical_high',
  CRITICAL_LOW: 'critical_low',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
};

export const STATUS_COLORS = {
  [STATUS_TYPES.NORMAL]: '#10B981',      // Green
  [STATUS_TYPES.WARNING_HIGH]: '#F59E0B', // Orange
  [STATUS_TYPES.WARNING_LOW]: '#F59E0B',  // Orange
  [STATUS_TYPES.CRITICAL_HIGH]: '#EF4444', // Red
  [STATUS_TYPES.CRITICAL_LOW]: '#EF4444',  // Red
  [STATUS_TYPES.OFFLINE]: '#6B7280',      // Gray
  [STATUS_TYPES.UNKNOWN]: '#9CA3AF'       // Light Gray
};

export const STATUS_LABELS = {
  [STATUS_TYPES.NORMAL]: 'Normal',
  [STATUS_TYPES.WARNING_HIGH]: 'High Warning',
  [STATUS_TYPES.WARNING_LOW]: 'Low Warning',
  [STATUS_TYPES.CRITICAL_HIGH]: 'Critical High',
  [STATUS_TYPES.CRITICAL_LOW]: 'Critical Low',
  [STATUS_TYPES.OFFLINE]: 'Offline',
  [STATUS_TYPES.UNKNOWN]: 'Unknown'
};

// Connection status
export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

// Time ranges for charts and data
export const TIME_RANGES = {
  '1h': { label: '1 Hour', seconds: 3600 },
  '6h': { label: '6 Hours', seconds: 21600 },
  '24h': { label: '24 Hours', seconds: 86400 },
  '7d': { label: '7 Days', seconds: 604800 },
  '30d': { label: '30 Days', seconds: 2592000 }
};

// Update intervals (in milliseconds)
export const UPDATE_INTERVALS = {
  CHART_UPDATE: 1000,        // 1 second
  API_REFRESH: 30000,        // 30 seconds
  HEALTH_CHECK: 60000,       // 1 minute
  RECONNECT_DELAY: 3000,     // 3 seconds
  HEARTBEAT: 30000,          // 30 seconds
  NOTIFICATION_AUTO_CLOSE: 5000 // 5 seconds
};

// Chart configuration constants
export const CHART_CONFIG = {
  MAX_POINTS: 100,
  UPDATE_INTERVAL: 1000,
  GAUGE_MIN: 0,
  GAUGE_MAX: 100,
  LINE_WIDTH: 2,
  MARKER_SIZE: 4,
  ANIMATION_DURATION: 300
};

// Default device thresholds (fallback values)
export const DEFAULT_THRESHOLDS = {
  'device-001': { // Temperature
    normalMin: 20,
    normalMax: 80,
    alertMin: 15,
    alertMax: 85
  },
  'device-002': { // Pressure
    normalMin: 10,
    normalMax: 50,
    alertMin: 5,
    alertMax: 55
  },
  'device-003': { // Vibration
    normalMin: 0,
    normalMax: 100,
    alertMin: 0,
    alertMax: 120
  },
  'device-004': { // Production
    normalMin: 100,
    normalMax: 500,
    alertMin: 50,
    alertMax: 600
  },
  'device-005': { // Quality
    normalMin: 85,
    normalMax: 100,
    alertMin: 80,
    alertMax: 100
  }
};

// API endpoints (for reference)
export const API_ENDPOINTS = {
  DEVICES: '/api/devices',
  DEVICE_CURRENT: '/api/devices/:id/current',
  DEVICE_HISTORY: '/api/devices/:id/history',
  SYSTEM_HEALTH: '/api/health',
  SYSTEM_METRICS: '/api/metrics',
  ALERTS: '/api/alerts'
};

// WebSocket events
export const WS_EVENTS = {
  // Client to Server
  SUBSCRIBE_DEVICE: 'subscribe-device',
  UNSUBSCRIBE_DEVICE: 'unsubscribe-device',
  SUBSCRIBE_ALL_DEVICES: 'subscribe-all-devices',
  SUBSCRIBE_ALERTS: 'subscribe-alerts',
  SUBSCRIBE_SYSTEM: 'subscribe-system',
  PING: 'ping',
  
  // Server to Client
  SENSOR_DATA: 'sensor-data',
  DEVICE_STATUS: 'device-status',
  ALERT_TRIGGERED: 'alert-triggered',
  ALERT_RESOLVED: 'alert-resolved',
  SYSTEM_STATUS: 'system-status',
  SERVICE_HEALTH: 'service-health',
  PONG: 'pong',
  ERROR: 'error'
};

// CSS class prefixes
export const CSS_CLASSES = {
  DEVICE_CARD: 'device-card',
  CHART_CONTAINER: 'chart-container',
  STATUS_INDICATOR: 'status-indicator',
  NOTIFICATION: 'notification',
  LOADING_SPINNER: 'loading-spinner'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'iot-dashboard-theme',
  PREFERENCES: 'iot-dashboard-preferences',
  LAST_VISIT: 'iot-dashboard-last-visit'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  WEBSOCKET_ERROR: 'Real-time connection failed. Some features may not work properly.',
  DATA_LOAD_ERROR: 'Failed to load data. Please refresh the page.',
  DEVICE_OFFLINE: 'Device is currently offline.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CONNECTED: 'Successfully connected to real-time data stream.',
  DATA_UPDATED: 'Data has been updated successfully.',
  SETTINGS_SAVED: 'Settings have been saved.',
  ALERT_ACKNOWLEDGED: 'Alert has been acknowledged.',
  ALERT_RESOLVED: 'Alert has been resolved.'
};

// Feature flags (for enabling/disabling features during development)
export const FEATURE_FLAGS = {
  ENABLE_ALERTS: true,
  ENABLE_EXPORT: true,
  ENABLE_THEMES: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOUND_ALERTS: false,
  ENABLE_EMAIL_NOTIFICATIONS: false
};

export default {
  DEVICE_IDS,
  DEVICE_TYPES,
  DEVICE_NAMES,
  DEVICE_UNITS,
  DEVICE_LOCATIONS,
  STATUS_TYPES,
  STATUS_COLORS,
  STATUS_LABELS,
  CONNECTION_STATUS,
  NOTIFICATION_TYPES,
  TIME_RANGES,
  UPDATE_INTERVALS,
  CHART_CONFIG,
  DEFAULT_THRESHOLDS,
  WS_EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS
};
