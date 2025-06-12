# IoT Monitoring System - Route Fix Project

## Project Overview
Fixed a critical routing issue in the IoT monitoring system where the `/devices/:id/current` endpoint was returning 404 errors due to Express.js route registration order conflicts.

## Problem Statement
- The endpoint `http://localhost:3002/devices/device-001/current` was returning 404 errors
- Both direct access and API Gateway proxy access were failing
- Other endpoints in the system were working correctly

## Root Cause Analysis
The issue was caused by **Express.js route registration order conflict**:

1. **Route Definitions**:
   - `devices.js`: `/devices/:id` (general route)
   - `device-current.js`: `/devices/:id/current` (specific route)

2. **Original Registration Order** (in `index.js`):
   ```javascript
   app.use(deviceRoutes);           // /devices/:id registered first
   app.use(deviceCurrentRoutes);    // /devices/:id/current registered second
   ```

3. **The Problem**: 
   - Express matches routes in registration order
   - When requesting `/devices/device-001/current`, Express matched `/devices/:id` first
   - It treated `device-001/current` as the `:id` parameter
   - The more specific route was never reached

## Solution Implementation
**Fixed by reordering route registration** to put more specific routes first:

```javascript
// Mount API routes - Order matters! More specific routes must come first
app.use(deviceCurrentRoutes);  // More specific: /devices/:id/current
app.use(deviceRoutes);         // More general: /devices/:id
app.use(sensorReadingRoutes);
app.use(metricsRoutes);
```

## Key Technical Insights
- **Express.js Route Matching**: Routes are matched in the order they are registered
- **Specificity Principle**: More specific routes must be registered before general ones
- **Pattern Matching**: Express treats route parameters (`:id`) as wildcards that match any string

## Verification Results
After the fix, both endpoints work correctly:

1. **Direct Access**: `http://localhost:3002/devices/device-001/current` ✅
2. **API Gateway Proxy**: `http://localhost:3000/api/devices/device-001/current` ✅

Both return proper JSON responses with device current state data including:
- Device information (ID, type, location)
- Current readings (value, timestamp, unit)
- Status and thresholds
- Statistics (trend, average, data points)

## File Modified
- `services/data-ingestion/src/index.js`: Reordered route registration

## System Architecture
This fix ensures the microservices architecture works as intended:
- **Data Ingestion Service** (Port 3002): Handles device data endpoints
- **API Gateway** (Port 3000): Proxies requests with path rewriting
- **Route Flow**: Client → API Gateway → Data Ingestion Service

## Future Considerations
- Always register more specific Express routes before general ones
- Consider using route namespacing or different base paths to avoid conflicts
- Add route debugging/logging in development to identify routing issues early
