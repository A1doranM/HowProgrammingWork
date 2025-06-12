import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for fetching system health
export const fetchSystemHealth = createAsyncThunk(
  'system/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSystemHealth();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching system metrics
export const fetchSystemMetrics = createAsyncThunk(
  'system/fetchSystemMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSystemMetrics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const systemSlice = createSlice({
  name: 'system',
  initialState: {
    health: {
      status: 'unknown',
      services: {},
      uptime: 0,
      timestamp: null,
    },
    metrics: {
      totalDevices: 0,
      activeDevices: 0,
      activeAlertsCount: 0,
      dataPointsLastHour: 0,
      systemHealth: 'unknown',
    },
    loading: false,
    error: null,
    lastHealthCheck: null,
  },
  reducers: {
    updateSystemStatus: (state, action) => {
      const { status, timestamp } = action.payload;
      state.health.status = status;
      state.health.timestamp = timestamp || new Date().toISOString();
    },
    updateSystemMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setSystemError: (state, action) => {
      state.error = action.payload;
    },
    clearSystemError: (state) => {
      state.error = null;
    },
    updateServiceHealth: (state, action) => {
      const { serviceName, status, responseTime } = action.payload;
      state.health.services[serviceName] = {
        status,
        responseTime,
        lastCheck: new Date().toISOString(),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch system health
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        // Transform backend health data format
        const healthData = action.payload;
        state.health = {
          status: 'healthy', // Set as healthy if we get a successful response
          uptime: healthData.uptime || 0,
          timestamp: healthData.timestamp,
          services: state.health.services, // Keep existing services
          memory: healthData.memory
        };
        
        // Update metrics with calculated values
        state.metrics = {
          ...state.metrics,
          systemHealth: 'healthy'
        };
        
        state.lastHealthCheck = new Date().toISOString();
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch system health';
        state.health.status = 'error';
      })
      // Fetch system metrics
      .addCase(fetchSystemMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = { ...state.metrics, ...action.payload };
      })
      .addCase(fetchSystemMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch system metrics';
      });
  },
});

export const {
  updateSystemStatus,
  updateSystemMetrics,
  setSystemError,
  clearSystemError,
  updateServiceHealth,
} = systemSlice.actions;

// Selectors
export const selectSystemHealth = (state) => state.system.health;
export const selectSystemMetrics = (state) => state.system.metrics;
export const selectSystemStatus = (state) => state.system.health.status;
export const selectSystemLoading = (state) => state.system.loading;
export const selectSystemError = (state) => state.system.error;
export const selectLastHealthCheck = (state) => state.system.lastHealthCheck;
export const selectServiceHealth = (serviceName) => (state) => 
  state.system.health.services[serviceName];

export default systemSlice.reducer;
