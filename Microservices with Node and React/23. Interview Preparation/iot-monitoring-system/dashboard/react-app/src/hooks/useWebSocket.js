import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import websocketService from '../services/websocket';
import { selectConnectionStatus } from '../store/slices/devicesSlice';
import { selectRealTimeEnabled } from '../store/slices/uiSlice';

/**
 * Custom hook for managing WebSocket connection and subscriptions
 * Automatically connects on mount and disconnects on unmount
 * Handles reconnection when real-time is re-enabled
 */
export const useWebSocket = () => {
  const connectionStatus = useSelector(selectConnectionStatus);
  const realTimeEnabled = useSelector(selectRealTimeEnabled);
  const isInitializedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isInitializedRef.current && realTimeEnabled) {
      console.log('🔌 Initializing WebSocket connection');
      websocketService.connect();
      isInitializedRef.current = true;
    }

    return () => {
      if (isInitializedRef.current) {
        console.log('🔌 Cleaning up WebSocket connection');
        websocketService.disconnect();
        isInitializedRef.current = false;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      }
    };
  }, [realTimeEnabled]);

  // Handle real-time enable/disable
  useEffect(() => {
    if (realTimeEnabled && connectionStatus === 'disconnected' && isInitializedRef.current) {
      // Reconnect after a short delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Reconnecting WebSocket (real-time re-enabled)');
        websocketService.connect();
      }, 1000);
    } else if (!realTimeEnabled && connectionStatus === 'connected') {
      console.log('⏸️ Disconnecting WebSocket (real-time disabled)');
      websocketService.disconnect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [realTimeEnabled, connectionStatus]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    
    // Connection control
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    reconnect: () => websocketService.reconnect(),
    
    // Subscription methods
    subscribeToDevice: (deviceId) => websocketService.subscribeToDevice(deviceId),
    unsubscribeFromDevice: (deviceId) => websocketService.unsubscribeFromDevice(deviceId),
    subscribeToAlerts: () => websocketService.subscribeToAlerts(),
    subscribeToSystem: () => websocketService.subscribeToSystem(),
    
    // Utility methods
    emit: (event, data) => websocketService.emit(event, data),
  };
};

/**
 * Hook for device-specific WebSocket subscriptions
 * Automatically subscribes to a specific device when connected
 */
export const useDeviceWebSocket = (deviceId) => {
  const { connectionStatus, subscribeToDevice, unsubscribeFromDevice } = useWebSocket();
  const deviceIdRef = useRef(deviceId);

  useEffect(() => {
    deviceIdRef.current = deviceId;
  }, [deviceId]);

  useEffect(() => {
    if (connectionStatus === 'connected' && deviceIdRef.current) {
      subscribeToDevice(deviceIdRef.current);
      
      return () => {
        unsubscribeFromDevice(deviceIdRef.current);
      };
    }
  }, [connectionStatus, subscribeToDevice, unsubscribeFromDevice]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    deviceId: deviceIdRef.current,
  };
};

/**
 * Hook for managing WebSocket reconnection with exponential backoff
 */
export const useWebSocketReconnect = () => {
  const { connectionStatus, reconnect } = useWebSocket();
  const reconnectAttempts = useRef(0);
  const maxAttempts = 5;
  const baseDelay = 1000;

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return false;
    }

    const delay = baseDelay * Math.pow(2, reconnectAttempts.current);
    
    setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${reconnectAttempts.current + 1}/${maxAttempts}`);
      reconnect();
      reconnectAttempts.current++;
    }, delay);

    return true;
  };

  // Reset attempts on successful connection
  useEffect(() => {
    if (connectionStatus === 'connected') {
      reconnectAttempts.current = 0;
    }
  }, [connectionStatus]);

  return {
    attemptReconnect,
    reconnectAttempts: reconnectAttempts.current,
    maxAttempts,
    canReconnect: reconnectAttempts.current < maxAttempts,
  };
};

export default useWebSocket;
