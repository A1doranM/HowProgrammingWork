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
        // Ignore these action types for real-time data updates
        ignoredActions: ['devices/updateRealTimeData', 'devices/updateDeviceStatus'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.timestamp'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
