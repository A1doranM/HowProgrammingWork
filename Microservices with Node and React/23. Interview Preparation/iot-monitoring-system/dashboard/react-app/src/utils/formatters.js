import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { 
  STATUS_TYPES, 
  STATUS_COLORS, 
  STATUS_LABELS,
  DEFAULT_THRESHOLDS,
  DEVICE_NAMES,
  DEVICE_UNITS 
} from './constants';

/**
 * Format numeric values with appropriate decimal places
 */
export const formatValue = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const num = Number(value);
  
  // For very large numbers, use compact notation
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  // For percentages, show 1 decimal place
  if (num <= 100 && num >= 0 && decimals === 2) {
    return num.toFixed(1);
  }
  
  return num.toFixed(decimals);
};

/**
 * Format values with units
 */
export const formatValueWithUnit = (value, unit, decimals = 2) => {
  const formattedValue = formatValue(value, decimals);
  return `${formattedValue} ${unit || ''}`.trim();
};

/**
 * Determine device status based on value and thresholds
 */
export const getDeviceStatus = (deviceId, value, customThresholds = null) => {
  if (value === null || value === undefined || isNaN(value)) {
    return STATUS_TYPES.OFFLINE;
  }

  const thresholds = customThresholds || DEFAULT_THRESHOLDS[deviceId];
  if (!thresholds) {
    return STATUS_TYPES.UNKNOWN;
  }

  const { normalMin, normalMax, alertMin, alertMax } = thresholds;

  // Critical alerts (outside alert thresholds)
  if (alertMax && value > alertMax) {
    return STATUS_TYPES.CRITICAL_HIGH;
  }
  if (alertMin && value < alertMin) {
    return STATUS_TYPES.CRITICAL_LOW;
  }

  // Warnings (outside normal range but within alert range)
  if (normalMax && value > normalMax) {
    return STATUS_TYPES.WARNING_HIGH;
  }
  if (normalMin && value < normalMin) {
    return STATUS_TYPES.WARNING_LOW;
  }

  return STATUS_TYPES.NORMAL;
};

/**
 * Get status display text
 */
export const getStatusText = (status) => {
  return STATUS_LABELS[status] || 'Unknown';
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[STATUS_TYPES.UNKNOWN];
};

/**
 * Get device friendly name
 */
export const getDeviceName = (deviceId) => {
  return DEVICE_NAMES[deviceId] || deviceId;
};

/**
 * Get device unit
 */
export const getDeviceUnit = (deviceId) => {
  return DEVICE_UNITS[deviceId] || '';
};

/**
 * Format timestamp to human readable format
 */
export const formatTimestamp = (timestamp, formatStr = 'yyyy-MM-dd HH:mm:ss') => {
  if (!timestamp) return 'Never';
  
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
};

/**
 * Format timestamp for chart display (short format)
 */
export const formatChartTimestamp = (timestamp) => {
  return formatTimestamp(timestamp, 'HH:mm:ss');
};

/**
 * Format timestamp as relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';
  
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format duration in seconds to human readable format
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Format uptime in a readable format
 */
export const formatUptime = (uptimeSeconds) => {
  if (!uptimeSeconds || uptimeSeconds < 0) return 'Unknown';
  
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format file sizes
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format connection status for display
 */
export const formatConnectionStatus = (status) => {
  const statusMap = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
    reconnecting: 'Reconnecting...'
  };
  
  return statusMap[status] || 'Unknown';
};

/**
 * Format threshold range for display
 */
export const formatThresholdRange = (min, max, unit = '') => {
  if (min === null || min === undefined) {
    return max !== null && max !== undefined ? `≤ ${formatValue(max)} ${unit}`.trim() : '';
  }
  
  if (max === null || max === undefined) {
    return `≥ ${formatValue(min)} ${unit}`.trim();
  }
  
  return `${formatValue(min)} - ${formatValue(max)} ${unit}`.trim();
};

/**
 * Format alert threshold for display
 */
export const formatAlertThreshold = (alertMin, alertMax, unit = '') => {
  const parts = [];
  
  if (alertMin !== null && alertMin !== undefined) {
    parts.push(`< ${formatValue(alertMin)} ${unit}`.trim());
  }
  
  if (alertMax !== null && alertMax !== undefined) {
    parts.push(`> ${formatValue(alertMax)} ${unit}`.trim());
  }
  
  return parts.join(' | ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format device ID for display (remove prefix, capitalize)
 */
export const formatDeviceId = (deviceId) => {
  if (!deviceId) return '';
  
  // Remove 'device-' prefix if present
  const cleanId = deviceId.replace(/^device-/, '');
  
  // Format as "Device XXX"
  return `Device ${cleanId.toUpperCase()}`;
};

/**
 * Format API response data for charts
 */
export const formatChartData = (data, deviceId) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(point => ({
    x: point.timestamp,
    y: point.value,
    status: getDeviceStatus(deviceId, point.value),
    deviceId: point.deviceId || deviceId
  }));
};

/**
 * Calculate and format statistics from data array
 */
export const calculateStats = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      trend: 'stable'
    };
  }
  
  const values = data.map(point => Number(point.value || point.y || point)).filter(v => !isNaN(v));
  
  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      trend: 'stable'
    };
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Simple trend calculation (comparing first and last quarter)
  let trend = 'stable';
  if (values.length >= 4) {
    const firstQuarter = values.slice(0, Math.floor(values.length / 4));
    const lastQuarter = values.slice(-Math.floor(values.length / 4));
    
    const firstAvg = firstQuarter.reduce((sum, val) => sum + val, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
    
    const change = ((lastAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
  }
  
  return {
    count: values.length,
    min,
    max,
    avg,
    trend
  };
};

/**
 * Format trend for display
 */
export const formatTrend = (trend) => {
  const trendMap = {
    increasing: '↗ Increasing',
    decreasing: '↘ Decreasing',
    stable: '→ Stable'
  };
  
  return trendMap[trend] || '→ Stable';
};

/**
 * Get trend color
 */
export const getTrendColor = (trend) => {
  const colorMap = {
    increasing: '#10B981', // Green
    decreasing: '#EF4444', // Red
    stable: '#6B7280'      // Gray
  };
  
  return colorMap[trend] || colorMap.stable;
};

export default {
  formatValue,
  formatValueWithUnit,
  getDeviceStatus,
  getStatusText,
  getStatusColor,
  getDeviceName,
  getDeviceUnit,
  formatTimestamp,
  formatChartTimestamp,
  formatRelativeTime,
  formatDuration,
  formatUptime,
  formatPercentage,
  formatFileSize,
  formatConnectionStatus,
  formatThresholdRange,
  formatAlertThreshold,
  truncateText,
  capitalizeWords,
  formatDeviceId,
  formatChartData,
  calculateStats,
  formatTrend,
  getTrendColor
};
