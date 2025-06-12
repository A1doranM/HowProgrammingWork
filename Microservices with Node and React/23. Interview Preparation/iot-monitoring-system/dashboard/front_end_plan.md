# React Dashboard Frontend Implementation Plan
## IoT Monitoring System - Frontend Development

### 🎯 **PROJECT OVERVIEW**

This document outlines the complete implementation plan for the React dashboard frontend that will integrate with the existing IoT monitoring backend system. The dashboard will provide real-time visualization of IoT sensor data with live charts and device status monitoring.

---

## 🏗️ **CORE FEATURES (PHASE 1)**

### **Primary Implementation Focus**
1. **Overview Dashboard** - Real-time device status grid (5 device cards)
2. **Real-time Charts** - Plotly charts with live data updates  
3. **WebSocket Integration** - Connect to ws://localhost:3003

### **Extensible Architecture (Future Phases)**
4. **Device Management** - Individual device monitoring and configuration
5. **Alert System** - Active alerts list with acknowledge/resolve actions

**Note**: Responsive design skipped for now - focusing on desktop-optimized experience.

---

## 🛠️ **TECHNOLOGY STACK**

### **Core Technologies**
- **React 18** - Modern hooks and functional components
- **Redux Toolkit** - State management with RTK Query
- **Plotly.js** - Interactive charts and data visualization
- **Socket.io-client** - Real-time WebSocket communication
- **Axios** - REST API calls
- **React Router** - Navigation (prepared for future extensions)

### **Development & Deployment**
- **Docker** - Containerization for deployment
- **Nginx** - Production web server
- **Node.js 18** - Build environment
- **Webpack** - Bundling (via Create React App)

### **Styling & UI**
- **CSS Modules** - Component-scoped styling
- **CSS Grid & Flexbox** - Layout management
- **Modern CSS** - Custom properties and animations

---

## 📁 **PROJECT STRUCTURE**

```
dashboard/
├── front_end_plan.md                    # This implementation plan
├── react-app/
│   ├── package.json                     # Dependencies and scripts
│   ├── Dockerfile                       # Multi-stage Docker build
│   ├── nginx.conf                       # Production Nginx config
│   ├── .dockerignore                    # Docker ignore rules
│   ├── public/
│   │   ├── index.html                   # HTML template
│   │   ├── favicon.ico                  # App icon
│   │   └── manifest.json                # PWA manifest
│   └── src/
│       ├── index.js                     # React entry point
│       ├── App.js                       # Main App component
│       ├── components/
│       │   ├── Dashboard/
│       │   │   ├── DashboardOverview.jsx    # Main dashboard layout
│       │   │   ├── DeviceGrid.jsx           # 5-device grid container
│       │   │   ├── DeviceCard.jsx           # Individual device card
│       │   │   └── SystemHealth.jsx         # System status indicator
│       │   ├── Charts/
│       │   │   ├── RealTimeChart.jsx        # Live line charts
│       │   │   ├── GaugeChart.jsx           # Current value gauges
│       │   │   ├── TrendChart.jsx           # Historical trends
│       │   │   └── ChartContainer.jsx       # Chart wrapper component
│       │   ├── Layout/
│       │   │   ├── Header.jsx               # App header with title
│       │   │   ├── Sidebar.jsx              # Navigation (future)
│       │   │   └── Footer.jsx               # Footer (future)
│       │   ├── Common/
│       │   │   ├── LoadingSpinner.jsx       # Loading states
│       │   │   ├── ErrorBoundary.jsx        # Error handling
│       │   │   └── StatusIndicator.jsx      # Status badges
│       │   ├── Devices/ (Future Extension)
│       │   │   ├── DeviceDetails.jsx        # Individual device view
│       │   │   ├── DeviceConfig.jsx         # Device configuration
│       │   │   └── DeviceHistory.jsx        # Historical data view
│       │   └── Alerts/ (Future Extension)
│       │       ├── AlertsList.jsx           # Active alerts list
│       │       ├── AlertCard.jsx            # Individual alert
│       │       └── AlertFilters.jsx         # Alert filtering
│       ├── hooks/
│       │   ├── useWebSocket.js              # WebSocket connection hook
│       │   ├── useApi.js                    # API calls hook
│       │   ├── useRealTimeData.js           # Real-time data management
│       │   ├── useDevices.js                # Device data hook
│       │   └── useChartData.js              # Chart data processing
│       ├── services/
│       │   ├── api.js                       # Axios API configuration
│       │   ├── websocket.js                 # Socket.io setup
│       │   ├── plotlyConfig.js              # Plotly chart config
│       │   └── dataFormatter.js             # Data transformation
│       ├── store/
│       │   ├── index.js                     # Redux store setup
│       │   └── slices/
│       │       ├── devicesSlice.js          # Device state management
│       │       ├── alertsSlice.js           # Alerts state (future)
│       │       ├── systemSlice.js           # System status state
│       │       └── uiSlice.js               # UI state (loading, errors)
│       ├── utils/
│       │   ├── constants.js                 # App constants
│       │   ├── formatters.js                # Data formatting utilities
│       │   ├── dateHelpers.js               # Date/time utilities
│       │   └── chartHelpers.js              # Chart utility functions
│       └── styles/
│           ├── global.css                   # Global styles and variables
│           ├── dashboard.css                # Dashboard-specific styles
│           ├── charts.css                   # Chart styling
│           └── components.css               # Reusable component styles
├── docker-compose.override.yml (Addition to main compose)
└── README.md                               # Setup and development guide
```

---

## 📋 **DETAILED IMPLEMENTATION STEPS**

### **Step 1: Project Setup & Dependencies** (30 minutes)

#### **1.1 Initialize React Application**
```bash
cd dashboard/
npx create-react-app react-app
cd react-app
```

#### **1.2 Install Core Dependencies**
```bash
npm install @reduxjs/toolkit react-redux socket.io-client axios plotly.js-dist-min
npm install react-router-dom date-fns
npm install --save-dev @types/plotly.js
```

#### **1.3 Package.json Dependencies**
```json
{
  "name": "iot-dashboard",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "socket.io-client": "^4.7.2",
    "axios": "^1.5.0",
    "plotly.js-dist-min": "^2.26.0",
    "react-router-dom": "^6.15.0",
    "date-fns": "^2.30.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### **Step 2: Docker Configuration** (30 minutes)

#### **2.1 Dockerfile (Multi-stage Build)**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### **2.2 Nginx Configuration**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (for development)
    location /api/ {
        proxy_pass http://host.docker.internal:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://host.docker.internal:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### **Step 3: Redux Store Setup** (45 minutes)

#### **3.1 Store Configuration (store/index.js)**
```javascript
import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from './slices/devicesSlice';
import systemReducer from './slices/systemSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    system: systemReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['devices/updateRealTimeData'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### **3.2 Devices Slice (store/slices/devicesSlice.js)**
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for fetching devices
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async () => {
    const response = await apiService.getDevices();
    return response.data;
  }
);

const devicesSlice = createSlice({
  name: 'devices',
  initialState: {
    devices: {},
    currentReadings: {},
    loading: false,
    error: null,
    lastUpdate: null,
  },
  reducers: {
    updateRealTimeData: (state, action) => {
      const { deviceId, data } = action.payload;
      state.currentReadings[deviceId] = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      state.lastUpdate = new Date().toISOString();
    },
    updateDeviceStatus: (state, action) => {
      const { deviceId, status } = action.payload;
      if (state.devices[deviceId]) {
        state.devices[deviceId].status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(device => {
          state.devices[device.deviceId] = device;
        });
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateRealTimeData, updateDeviceStatus } = devicesSlice.actions;
export default devicesSlice.reducer;
```

### **Step 4: WebSocket Service** (60 minutes)

#### **4.1 WebSocket Service (services/websocket.js)**
```javascript
import io from 'socket.io-client';
import { store } from '../store';
import { updateRealTimeData, updateDeviceStatus } from '../store/slices/devicesSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3003';
    
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Subscribe to all device updates
      this.socket.emit('subscribe-all-devices');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    // Data events
    this.socket.on('sensor-data', (data) => {
      store.dispatch(updateRealTimeData({
        deviceId: data.deviceId,
        data: {
          value: data.value,
          unit: data.unit,
          status: data.status,
          timestamp: data.timestamp,
        }
      }));
    });

    this.socket.on('device-status', (data) => {
      store.dispatch(updateDeviceStatus({
        deviceId: data.deviceId,
        status: data.status,
      }));
    });

    // System events
    this.socket.on('system-status', (data) => {
      // Handle system status updates
      console.log('System status:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToDevice(deviceId) {
    if (this.socket) {
      this.socket.emit('subscribe-device', { deviceId });
    }
  }

  unsubscribeFromDevice(deviceId) {
    if (this.socket) {
      this.socket.emit('unsubscribe-device', { deviceId });
    }
  }
}

export default new WebSocketService();
```

#### **4.2 WebSocket Hook (hooks/useWebSocket.js)**
```javascript
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import websocketService from '../services/websocket';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!isConnectedRef.current) {
      websocketService.connect();
      isConnectedRef.current = true;
    }

    return () => {
      websocketService.disconnect();
      isConnectedRef.current = false;
    };
  }, []);

  return {
    subscribeToDevice: websocketService.subscribeToDevice.bind(websocketService),
    unsubscribeFromDevice: websocketService.unsubscribeFromDevice.bind(websocketService),
  };
};
```

### **Step 5: API Service** (30 minutes)

#### **5.1 API Configuration (services/api.js)**
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Device endpoints
  getDevices: () => apiClient.get('/api/devices'),
  getDevice: (deviceId) => apiClient.get(`/api/devices/${deviceId}`),
  getDeviceCurrent: (deviceId) => apiClient.get(`/api/devices/${deviceId}/current`),
  getDeviceHistory: (deviceId, params = {}) => 
    apiClient.get(`/api/devices/${deviceId}/history`, { params }),

  // System endpoints
  getSystemHealth: () => apiClient.get('/api/health'),
  getSystemMetrics: () => apiClient.get('/api/metrics'),

  // Future: Alert endpoints
  getAlerts: () => apiClient.get('/api/alerts'),
  acknowledgeAlert: (alertId) => apiClient.put(`/api/alerts/${alertId}/acknowledge`),
  resolveAlert: (alertId) => apiClient.put(`/api/alerts/${alertId}/resolve`),
};

export default apiClient;
```

### **Step 6: Device Card Component** (90 minutes)

#### **6.1 DeviceCard Component (components/Dashboard/DeviceCard.jsx)**
```javascript
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GaugeChart from '../Charts/GaugeChart';
import { formatValue, getStatusColor, getStatusText } from '../../utils/formatters';
import './DeviceCard.css';

const DeviceCard = ({ deviceId }) => {
  const dispatch = useDispatch();
  const device = useSelector(state => state.devices.devices[deviceId]);
  const currentReading = useSelector(state => state.devices.currentReadings[deviceId]);

  const deviceStatus = useMemo(() => {
    if (!device || !currentReading) return 'offline';
    
    const value = currentReading.value;
    const { alertMin, alertMax, normalMin, normalMax } = device.thresholds || {};

    if (alertMax && value > alertMax) return 'critical_high';
    if (alertMin && value < alertMin) return 'critical_low';
    if (normalMax && value > normalMax) return 'warning_high';
    if (normalMin && value < normalMin) return 'warning_low';
    
    return 'normal';
  }, [device, currentReading]);

  if (!device) {
    return (
      <div className="device-card loading">
        <div className="device-card__header">
          <div className="loading-spinner"></div>
          <span>Loading device...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`device-card device-card--${deviceStatus}`}>
      <div className="device-card__header">
        <div className="device-card__info">
          <h3 className="device-card__title">{device.deviceType}</h3>
          <span className="device-card__id">{deviceId}</span>
          <span className="device-card__location">{device.location}</span>
        </div>
        <div className={`device-card__status device-card__status--${deviceStatus}`}>
          {getStatusText(deviceStatus)}
        </div>
      </div>

      <div className="device-card__content">
        <div className="device-card__gauge">
          <GaugeChart 
            value={currentReading?.value || 0}
            unit={device.unit}
            min={device.thresholds?.normalMin || 0}
            max={device.thresholds?.normalMax || 100}
            alertMin={device.thresholds?.alertMin}
            alertMax={device.thresholds?.alertMax}
            status={deviceStatus}
          />
        </div>

        <div className="device-card__details">
          <div className="device-card__reading">
            <span className="value">
              {formatValue(currentReading?.value || 0)}
            </span>
            <span className="unit">{device.unit}</span>
          </div>

          <div className="device-card__thresholds">
            <div className="threshold">
              <span className="label">Normal:</span>
              <span className="range">
                {formatValue(device.thresholds?.normalMin || 0)} - {formatValue(device.thresholds?.normalMax || 100)} {device.unit}
              </span>
            </div>
            {(device.thresholds?.alertMin || device.thresholds?.alertMax) && (
              <div className="threshold threshold--alert">
                <span className="label">Alert:</span>
                <span className="range">
                  {device.thresholds?.alertMin && `< ${formatValue(device.thresholds.alertMin)}`}
                  {device.thresholds?.alertMin && device.thresholds?.alertMax && ' | '}
                  {device.thresholds?.alertMax && `> ${formatValue(device.thresholds.alertMax)}`}
                </span>
              </div>
            )}
          </div>

          <div className="device-card__timestamp">
            Last update: {currentReading?.timestamp ? 
              new Date(currentReading.timestamp).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
```

#### **6.2 DeviceGrid Component (components/Dashboard/DeviceGrid.jsx)**
```javascript
import React from 'react';
import DeviceCard from './DeviceCard';
import { DEVICE_IDS } from '../../utils/constants';
import './DeviceGrid.css';

const DeviceGrid = () => {
  return (
    <div className="device-grid">
      <div className="device-grid__header">
        <h2>Device Status Overview</h2>
        <div className="device-grid__stats">
          <span className="stat">
            <span className="stat__value">{DEVICE_IDS.length}</span>
            <span className="stat__label">Total Devices</span>
          </span>
        </div>
      </div>
      
      <div className="device-grid__container">
        {DEVICE_IDS.map(deviceId => (
          <DeviceCard key={deviceId} deviceId={deviceId} />
        ))}
      </div>
    </div>
  );
};

export default DeviceGrid;
```

### **Step 7: Chart Components** (120 minutes)

#### **7.1 Plotly Configuration (services/plotlyConfig.js)**
```javascript
export const defaultPlotlyConfig = {
  responsive: true,
  displayModeBar: false,
  staticPlot: false,
  autosizable: true,
  showTips: false,
};

export const chartLayouts = {
  gauge: {
    margin: { t: 0, b: 0, l: 0, r: 0 },
    font: { size: 12, family: 'Arial, sans-serif' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  },
  
  timeSeries: {
    margin: { t: 20, b: 40, l: 60, r: 20 },
    xaxis: {
      title: 'Time',
      type: 'date',
      tickformat: '%H:%M:%S',
      showgrid: true,
      gridcolor: '#E1E5E9',
    },
    yaxis: {
      title: 'Value',
      showgrid: true,
      gridcolor: '#E1E5E9',
    },
    font: { size: 12, family: 'Arial, sans-serif' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'white',
    showlegend: false,
  },
};

export const statusColors = {
  normal: '#10B981',      // Green
  warning_high: '#F59E0B', // Orange
  warning_low: '#F59E0B',  // Orange
  critical_high: '#EF4444', // Red
  critical_low: '#EF4444',  // Red
  offline: '#6B7280',     // Gray
};
```

#### **7.2 Gauge Chart Component (components/Charts/GaugeChart.jsx)**
```javascript
import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { defaultPlotlyConfig, chartLayouts, statusColors } from '../../services/plotlyConfig';

const GaugeChart = ({ 
  value, 
  unit, 
  min = 0, 
  max = 100, 
  alertMin, 
  alertMax, 
  status = 'normal',
  width = 200,
  height = 200 
}) => {
  const data = useMemo(() => {
    const steps = [];
    const range = max - min;
    
    // Normal range (green)
    steps.push({
      range: [min, max],
      color: '#E5F7E5'
    });
    
    // Warning ranges (orange)
    if (alertMin && alertMin > min) {
      steps.push({
        range: [min, alertMin],
        color: '#FEF3E5'
      });
    }
    
    if (alertMax && alertMax < max) {
      steps.push({
        range: [alertMax, max],
        color: '#FEF3E5'
      });
    }

    return [{
      type: 'indicator',
      mode: 'gauge+number',
      value: value,
      title: {
        text: unit,
        font: { size: 14 }
      },
      number: {
        font: { size: 20 },
        suffix: ` ${unit}`
      },
      gauge: {
        axis: { 
          range: [min, max],
          ticksuffix: unit
        },
        bar: { 
          color: statusColors[status] || statusColors.normal,
          thickness: 0.8
        },
        bgcolor: 'white',
        borderwidth: 2,
        bordercolor: '#E1E5E9',
        steps: steps,
        threshold: {
          line: { color: statusColors[status], width: 4 },
          thickness: 0.75,
          value: value
        }
      }
    }];
  }, [value, unit, min, max, alertMin, alertMax, status]);

  const layout = useMemo(() => ({
    ...chartLayouts.gauge,
    width: width,
    height: height,
  }), [width, height]);

  return (
    <Plot
      data={data}
      layout={layout}
      config={defaultPlotlyConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default GaugeChart;
```

#### **7.3 Real-time Chart Component (components/Charts/RealTimeChart.jsx)**
```javascript
import React, { useMemo, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { useSelector } from 'react-redux';
import { defaultPlotlyConfig, chartLayouts, statusColors } from '../../services/plotlyConfig';
import { apiService } from '../../services/api';

const RealTimeChart = ({ deviceId, timeRange = '1h', maxPoints = 100 }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentReading = useSelector(state => state.devices.currentReadings[deviceId]);
  const device = useSelector(state => state.devices.devices[deviceId]);

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDeviceHistory(deviceId, {
          timeRange,
          points: maxPoints
        });
        setHistoricalData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      fetchHistoricalData();
    }
  }, [deviceId, timeRange, maxPoints]);

  // Combine historical and real-time data
  const chartData = useMemo(() => {
    if (loading || !historicalData.length) return [];

    // Create a copy of historical data
    let combinedData = [...historicalData];

    // Add current reading if it's newer than the last historical point
    if (currentReading && currentReading.timestamp) {
      const lastHistoricalTime = combinedData.length > 0 ? 
        new Date(combinedData[combinedData.length - 1].timestamp) : new Date(0);
      const currentTime = new Date(currentReading.timestamp);

      if (currentTime > lastHistoricalTime) {
        combinedData.push({
          timestamp: currentReading.timestamp,
          value: currentReading.value,
          status: currentReading.status || 'normal'
        });
      }
    }

    // Keep only the last maxPoints
    if (combinedData.length > maxPoints) {
      combinedData = combinedData.slice(-maxPoints);
    }

    const timestamps = combinedData.map(point => point.timestamp);
    const values = combinedData.map(point => point.value);
    const statuses = combinedData.map(point => point.status || 'normal');

    return [{
      type: 'scatter',
      mode: 'lines+markers',
      x: timestamps,
      y: values,
      line: {
        color: statusColors.normal,
        width: 2
      },
      marker: {
        size: 4,
        color: statuses.map(status => statusColors[status] || statusColors.normal)
      },
      name: device?.deviceType || 'Device'
    }];
  }, [historicalData, currentReading, device, loading, maxPoints]);

  const layout = useMemo(() => ({
    ...chartLayouts.timeSeries,
    title: `${device?.deviceType || 'Device'} - Real-time Data`,
    yaxis: {
      ...chartLayouts.timeSeries.yaxis,
      title: `Value (${device?.unit || 'units'})`
    }
  }), [device]);

  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  return (
    <Plot
      data={chartData}
      layout={layout}
      config={defaultPlotlyConfig}
      style={{ width: '100%', height: '300px' }}
    />
  );
};

export default RealTimeChart;
```

### **Step 8: Main Application Components** (60 minutes)

#### **8.1 App.js (Main Application)**
```javascript
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import { useWebSocket } from './hooks/useWebSocket';
import { fetchDevices } from './store/slices/devicesSlice';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  useWebSocket(); // Initialize WebSocket connection

  useEffect(() => {
    // Fetch initial device data
    store.dispatch(fetchDevices());
  }, []);

  return (
    <div className="app">
      <ErrorBoundary>
        <DashboardOverview />
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
```

#### **8.2 DashboardOverview Component (components/Dashboard/DashboardOverview.jsx)**
```javascript
import React from 'react';
import Header from '../Layout/Header';
import DeviceGrid from './DeviceGrid';
import SystemHealth from './SystemHealth';
import './DashboardOverview.css';

const DashboardOverview = () => {
  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard__main">
        <div className="dashboard__content">
          <SystemHealth />
          <DeviceGrid />
        </div>
      </main>
    </div>
  );
};

export default DashboardOverview;
```

#### **8.3 Header Component (components/Layout/Header.jsx)**
```javascript
import React from 'react';
import { useSelector } from 'react-redux';
import './Header.css';

const Header = () => {
  const lastUpdate = useSelector(state => state.devices.lastUpdate);
  const deviceCount = useSelector(state => Object.keys(state.devices.devices).length);

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__branding">
          <h1 className="header__title">IoT Monitoring Dashboard</h1>
          <span className="header__subtitle">Real-time Industrial Monitoring</span>
        </div>
        
        <div className="header__info">
          <div className="header__stat">
            <span className="header__stat-value">{deviceCount}</span>
            <span className="header__stat-label">Devices</span>
          </div>
          <div className="header__status">
            <div className="header__status-indicator active"></div>
            <span>Live Updates</span>
          </div>
          {lastUpdate && (
            <div className="header__last-update">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### **Step 9: Utility Functions** (30 minutes)

#### **9.1 Constants (utils/constants.js)**
```javascript
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

export const STATUS_COLORS = {
  normal: '#10B981',
  warning_high: '#F59E0B',
  warning_low: '#F59E0B', 
  critical_high: '#EF4444',
  critical_low: '#EF4444',
  offline: '#6B7280'
};

export const UPDATE_INTERVALS = {
  CHART_UPDATE: 1000, // 1 second
  API_REFRESH: 30000, // 30 seconds
  RECONNECT_DELAY: 3000 // 3 seconds
};
```

#### **9.2 Formatters (utils/formatters.js)**
```javascript
export const formatValue = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0';
  return Number(value).toFixed(decimals);
};

export const getStatusText = (status) => {
  const statusTexts = {
    normal: 'Normal',
    warning_high: 'High Warning',
    warning_low: 'Low Warning',
    critical_high: 'Critical High',
    critical_low: 'Critical Low',
    offline: 'Offline'
  };
  return statusTexts[status] || 'Unknown';
};

export const getStatusColor = (status) => {
  const colors = {
    normal: '#10B981',
    warning_high: '#F59E0B',
    warning_low: '#F59E0B',
    critical_high: '#EF4444', 
    critical_low: '#EF4444',
    offline: '#6B7280'
  };
  return colors[status] || colors.offline;
};

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
```

### **Step 10: Styling** (45 minutes)

#### **10.1 Global Styles (styles/global.css)**
```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #374151;
  --color-gray-700: #1F2937;
  --color-gray-800: #111827;
  --color-gray-900: #0F172A;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;

  /* Layout */
  --border-radius: 0.5rem;
  --border-radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-gray-700);
  background-color: var(--color-gray-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-gray-200);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }

.text-gray-500 { color: var(--color-gray-500); }
.text-gray-600 { color: var(--color-gray-600); }
.text-gray-700 { color: var(--color-gray-700); }

.bg-white { background-color: white; }
.bg-gray-50 { background-color: var(--color-gray-50); }

.border { border: 1px solid var(--color-gray-200); }
.border-none { border: none; }
.rounded { border-radius: var(--border-radius); }
.rounded-lg { border-radius: var(--border-radius-lg); }

.shadow { box-shadow: var(--shadow); }
.shadow-lg { box-shadow: var(--shadow-lg); }
```

### **Step 11: Docker Integration** (30 minutes)

#### **11.1 Docker Compose Addition**
```yaml
# Add this to the main docker-compose.yml services section
  react-dashboard:
    build:
      context: ./dashboard/react-app
      dockerfile: Dockerfile
    container_name: iot-react-dashboard
    ports:
      - "3005:80"
    environment:
      - REACT_APP_API_URL=http://localhost:3000
      - REACT_APP_WS_URL=ws://localhost:3003
    networks:
      - iot-network
    depends_on:
      - api-gateway
      - websocket-service
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### **11.2 .dockerignore**
```
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.env
```

---

## 🚀 **DEPLOYMENT & ACCESS**

### **Development Mode**
```bash
cd dashboard/react-app
npm start
# Access: http://localhost:3000
```

### **Docker Production Mode**
```bash
# Build and run dashboard
docker-compose up react-dashboard

# Access: http://localhost:3005
```

### **Full System with Dashboard**
```bash
# Run complete IoT system with dashboard
docker-compose up -d

# Access dashboard: http://localhost:3005
# Access API: http://localhost:3000
# Access WebSocket: ws://localhost:3003
```

---

## 📊 **SUCCESS CRITERIA**

### **Phase 1 Completion Checklist**
- [ ] Dashboard accessible at http://localhost:3005
- [ ] 5 device cards displaying real-time data
- [ ] Live charts updating every second
- [ ] WebSocket connection stable with auto-reconnection
- [ ] Docker container running successfully
- [ ] Integration with existing backend APIs working
- [ ] Real-time data flowing from WebSocket service
- [ ] Device status indicators working correctly
- [ ] Gauge charts showing current values with thresholds

### **Performance Targets**
- Page load time < 2 seconds
- Chart updates smooth at 1-second intervals
- WebSocket reconnection < 3 seconds
- Memory usage < 100MB in browser
- No memory leaks during extended operation

### **Visual Requirements**
- Clean, modern dashboard design
- Color-coded status indicators (green/yellow/red)
- Responsive grid layout for device cards
- Interactive Plotly charts with smooth animations
- Real-time timestamp updates
- Loading states and error handling

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues**

#### **WebSocket Connection Issues**
```javascript
// Check WebSocket URL in browser console
console.log('WebSocket URL:', process.env.REACT_APP_WS_URL);

// Verify WebSocket service is running
curl -I http://localhost:3003/health
```

#### **API Connection Issues**
```javascript
// Check API URL in browser console
console.log('API URL:', process.env.REACT_APP_API_URL);

// Test API endpoint
curl http://localhost:3000/api/devices
```

#### **Docker Build Issues**
```bash
# Clear Docker cache and rebuild
docker system prune -f
docker-compose build --no-cache react-dashboard
```

### **Debug Mode**
Add to browser console for debugging:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'socket.io-client:socket');

// Monitor Redux state
window.store = store;
console.log('Current state:', store.getState());
```

---

## 🎯 **FUTURE EXTENSIONS**

### **Phase 2: Device Management**
- Individual device detail pages
- Device configuration interface
- Historical data analysis
- Export functionality

### **Phase 3: Alert System**
- Alert management interface
- Real-time alert notifications
- Alert history and analytics
- Custom alert rules

### **Phase 4: Advanced Features**
- User authentication and roles
- Dashboard customization
- Mobile responsive design
- Offline mode support
- Data export to CSV/PDF

---

## 📝 **IMPLEMENTATION TIMELINE**

### **Estimated Development Time: 8-10 hours**

1. **Setup & Infrastructure** (1 hour)
   - Project initialization
   - Docker configuration
   - Dependencies installation

2. **Core Services** (2 hours)
   - Redux store setup
   - API service configuration
   - WebSocket integration

3. **Component Development** (4 hours)
   - Device cards implementation
   - Chart components
   - Dashboard layout

4. **Integration & Testing** (2 hours)
   - End-to-end integration
   - Real-time data flow testing
   - Performance optimization

5. **Polish & Deployment** (1 hour)
   - Styling and UX improvements
   - Docker deployment
   - Final testing

---

## 🎉 **CONCLUSION**

This implementation plan provides a complete roadmap for building a production-ready React dashboard that integrates seamlessly with the existing IoT monitoring backend. The architecture is designed for extensibility, performance, and maintainability.

**Key Benefits:**
- **Real-time Updates**: Live data streaming via WebSocket
- **Interactive Visualization**: Plotly charts with rich interactions  
- **Scalable Architecture**: Redux state management for complex data
- **Production Ready**: Docker containerization and Nginx serving
- **Extensible Design**: Prepared for future features and enhancements

**Ready to implement!** Follow the step-by-step guide to build a sophisticated IoT monitoring dashboard that showcases modern React development practices and real-time data visualization capabilities.
