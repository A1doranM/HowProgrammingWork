import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import { useWebSocket } from './hooks/useWebSocket';
import { fetchDevices, fetchCurrentReadings } from './store/slices/devicesSlice';
import { fetchSystemHealth } from './store/slices/systemSlice';
import { DEVICE_IDS } from './utils/constants';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    // Fetch initial data
    store.dispatch(fetchDevices());
    store.dispatch(fetchSystemHealth());
    store.dispatch(fetchCurrentReadings(DEVICE_IDS));
    
    // Set up periodic health checks and data refresh
    const healthCheckInterval = setInterval(() => {
      store.dispatch(fetchSystemHealth());
    }, 60000); // Every minute
    
    const dataRefreshInterval = setInterval(() => {
      store.dispatch(fetchCurrentReadings(DEVICE_IDS));
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(dataRefreshInterval);
    };
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
