import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Global loading states
    globalLoading: false,
    
    // Dashboard view settings
    dashboardView: 'overview', // overview, devices, analytics
    
    // Notifications
    notifications: [],
    
    // Theme and preferences
    theme: 'light', // light, dark
    refreshInterval: 30000, // 30 seconds
    
    // Chart settings
    chartTimeRange: '1h', // 1h, 6h, 24h
    maxChartPoints: 100,
    
    // UI state
    sidebarCollapsed: false,
    fullscreenChart: null, // deviceId if chart is fullscreen
    
    // Error handling
    globalError: null,
    
    // Real-time status
    realTimeEnabled: true,
    lastDataUpdate: null,
  },
  reducers: {
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setDashboardView: (state, action) => {
      state.dashboardView = action.payload;
    },
    
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },
    
    setChartTimeRange: (state, action) => {
      state.chartTimeRange = action.payload;
    },
    
    setMaxChartPoints: (state, action) => {
      state.maxChartPoints = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    setFullscreenChart: (state, action) => {
      state.fullscreenChart = action.payload;
    },
    
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    setRealTimeEnabled: (state, action) => {
      state.realTimeEnabled = action.payload;
    },
    
    updateLastDataUpdate: (state) => {
      state.lastDataUpdate = new Date().toISOString();
    },
    
    // Batch UI updates for performance
    batchUIUpdate: (state, action) => {
      const updates = action.payload;
      Object.keys(updates).forEach(key => {
        if (key in state) {
          state[key] = updates[key];
        }
      });
    },
  },
});

export const {
  setGlobalLoading,
  setDashboardView,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setTheme,
  setRefreshInterval,
  setChartTimeRange,
  setMaxChartPoints,
  toggleSidebar,
  setSidebarCollapsed,
  setFullscreenChart,
  setGlobalError,
  clearGlobalError,
  setRealTimeEnabled,
  updateLastDataUpdate,
  batchUIUpdate,
} = uiSlice.actions;

// Selectors
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectDashboardView = (state) => state.ui.dashboardView;
export const selectNotifications = (state) => state.ui.notifications;
export const selectTheme = (state) => state.ui.theme;
export const selectRefreshInterval = (state) => state.ui.refreshInterval;
export const selectChartTimeRange = (state) => state.ui.chartTimeRange;
export const selectMaxChartPoints = (state) => state.ui.maxChartPoints;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectFullscreenChart = (state) => state.ui.fullscreenChart;
export const selectGlobalError = (state) => state.ui.globalError;
export const selectRealTimeEnabled = (state) => state.ui.realTimeEnabled;
export const selectLastDataUpdate = (state) => state.ui.lastDataUpdate;

// Composite selectors
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectCriticalNotifications = (state) => 
  state.ui.notifications.filter(n => n.type === 'critical' || n.type === 'error');

export default uiSlice.reducer;
