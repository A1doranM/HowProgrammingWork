import axios from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add timestamp to avoid caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`❌ API Error (${status}):`, message);
    
    // Handle specific error cases
    if (status === 404) {
      console.warn('Resource not found:', error.config.url);
    } else if (status >= 500) {
      console.error('Server error:', message);
    } else if (status === 0 || error.code === 'ECONNREFUSED') {
      console.error('Network error - server may be down');
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Device endpoints
  getDevices: () => {
    return apiClient.get('/api/devices');
  },
  
  getDevice: (deviceId) => {
    return apiClient.get(`/api/devices/${deviceId}`);
  },
  
  getDeviceCurrent: (deviceId) => {
    return apiClient.get(`/api/devices/${deviceId}/current`);
  },
  
  getDeviceHistory: (deviceId, params = {}) => {
    return apiClient.get(`/api/devices/${deviceId}/history`, { 
      params: {
        timeRange: params.timeRange || '1h',
        points: params.points || 100,
        ...params
      }
    });
  },
  
  updateDeviceConfig: (deviceId, config) => {
    return apiClient.put(`/api/devices/${deviceId}/config`, config);
  },

  // System endpoints
  getSystemHealth: () => {
    return apiClient.get('/api/health');
  },
  
  getSystemStatus: () => {
    return apiClient.get('/api/status');
  },
  
  getSystemMetrics: () => {
    return apiClient.get('/api/metrics');
  },

  // Analytics endpoints
  getDashboardMetrics: () => {
    return apiClient.get('/api/metrics/dashboard');
  },
  
  getAnalyticsTrends: (deviceId, timeRange = '24h') => {
    return apiClient.get(`/api/analytics/trends/${deviceId}`, {
      params: { timeRange }
    });
  },
  
  getAnalyticsSummary: () => {
    return apiClient.get('/api/analytics/summary');
  },

  // Future: Alert endpoints (prepared for later implementation)
  getAlerts: (params = {}) => {
    return apiClient.get('/api/alerts', { params });
  },
  
  getAlert: (alertId) => {
    return apiClient.get(`/api/alerts/${alertId}`);
  },
  
  acknowledgeAlert: (alertId) => {
    return apiClient.put(`/api/alerts/${alertId}/acknowledge`);
  },
  
  resolveAlert: (alertId) => {
    return apiClient.put(`/api/alerts/${alertId}/resolve`);
  },
  
  getAlertsHistory: (params = {}) => {
    return apiClient.get('/api/alerts/history', { params });
  },

  // Utility methods
  ping: () => {
    return apiClient.get('/api/health');
  },
  
  // Batch operations for performance
  batchGetDeviceData: (deviceIds) => {
    const promises = deviceIds.map(deviceId => 
      apiService.getDeviceCurrent(deviceId).catch(error => ({
        deviceId,
        error: error.message
      }))
    );
    return Promise.allSettled(promises);
  }
};

// Helper function to check if API is available
export const checkApiHealth = async () => {
  try {
    const response = await apiService.ping();
    return {
      available: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      code: error.code
    };
  }
};

// Export the configured axios instance for direct use if needed
export default apiClient;
