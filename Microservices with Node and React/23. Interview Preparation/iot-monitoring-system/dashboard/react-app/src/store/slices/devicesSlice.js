import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunk for fetching devices
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDevices();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching device history
export const fetchDeviceHistory = createAsyncThunk(
  'devices/fetchDeviceHistory',
  async ({ deviceId, timeRange = '1h', points = 100 }, { rejectWithValue }) => {
    try {
      const response = await apiService.getDeviceHistory(deviceId, {
        timeRange,
        points
      });
      return { deviceId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const devicesSlice = createSlice({
  name: 'devices',
  initialState: {
    devices: {},
    currentReadings: {},
    historicalData: {},
    loading: false,
    error: null,
    lastUpdate: null,
    connectionStatus: 'disconnected', // disconnected, connecting, connected
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
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add historical data to existing device data
    addHistoricalData: (state, action) => {
      const { deviceId, data } = action.payload;
      if (!state.historicalData[deviceId]) {
        state.historicalData[deviceId] = [];
      }
      
      // Merge new data with existing, avoiding duplicates
      const existingTimestamps = new Set(
        state.historicalData[deviceId].map(point => point.timestamp)
      );
      
      const newData = data.filter(point => !existingTimestamps.has(point.timestamp));
      state.historicalData[deviceId] = [...state.historicalData[deviceId], ...newData]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Keep only last 200 points for performance
      if (state.historicalData[deviceId].length > 200) {
        state.historicalData[deviceId] = state.historicalData[deviceId].slice(-200);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        // Convert array to object keyed by deviceId
        if (Array.isArray(action.payload)) {
          action.payload.forEach(device => {
            state.devices[device.deviceId] = device;
          });
        } else if (action.payload.devices) {
          action.payload.devices.forEach(device => {
            state.devices[device.deviceId] = device;
          });
        }
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch devices';
      })
      // Fetch device history
      .addCase(fetchDeviceHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeviceHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { deviceId, data } = action.payload;
        state.historicalData[deviceId] = data.data || data;
      })
      .addCase(fetchDeviceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch device history';
      });
  },
});

export const { 
  updateRealTimeData, 
  updateDeviceStatus, 
  setConnectionStatus, 
  clearError,
  addHistoricalData 
} = devicesSlice.actions;

// Selectors
export const selectDevices = (state) => state.devices.devices;
export const selectCurrentReadings = (state) => state.devices.currentReadings;
export const selectDeviceById = (deviceId) => (state) => state.devices.devices[deviceId];
export const selectCurrentReadingById = (deviceId) => (state) => state.devices.currentReadings[deviceId];
export const selectHistoricalData = (deviceId) => (state) => state.devices.historicalData[deviceId] || [];
export const selectConnectionStatus = (state) => state.devices.connectionStatus;
export const selectDevicesLoading = (state) => state.devices.loading;
export const selectDevicesError = (state) => state.devices.error;
export const selectLastUpdate = (state) => state.devices.lastUpdate;

export default devicesSlice.reducer;
