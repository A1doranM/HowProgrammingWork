import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import { useWebSocket } from './hooks/useWebSocket';
import { fetchDevices } from './store/slices/devicesSlice';
import { fetchSystemHealth } from './store/slices/systemSlice';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    // Fetch initial data
    store.dispatch(fetchDevices());
    store.dispatch(fetchSystemHealth());
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(() => {
      store.dispatch(fetchSystemHealth());
    }, 60000); // Every minute

    return () => {
      clearInterval(healthCheckInterval);
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
