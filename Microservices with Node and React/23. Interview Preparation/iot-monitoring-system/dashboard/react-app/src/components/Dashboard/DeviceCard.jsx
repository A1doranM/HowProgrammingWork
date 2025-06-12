import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  selectDeviceById, 
  selectCurrentReadingById 
} from '../../store/slices/devicesSlice';
import { 
  getDeviceStatus,
  getStatusText,
  getStatusColor,
  getDeviceName,
  getDeviceUnit,
  formatValue,
  formatRelativeTime,
  formatThresholdRange
} from '../../utils/formatters';
import { 
  DEFAULT_THRESHOLDS,
  DEVICE_LOCATIONS 
} from '../../utils/constants';

const DeviceCard = ({ deviceId }) => {
  const device = useSelector(selectDeviceById(deviceId));
  const currentReading = useSelector(selectCurrentReadingById(deviceId));

  const deviceInfo = useMemo(() => {
    return {
      name: getDeviceName(deviceId),
      unit: getDeviceUnit(deviceId),
      location: DEVICE_LOCATIONS[deviceId] || 'Unknown Location',
      thresholds: device?.thresholds || DEFAULT_THRESHOLDS[deviceId] || {}
    };
  }, [device, deviceId]);

  const deviceStatus = useMemo(() => {
    if (!currentReading?.value && currentReading?.value !== 0) {
      return 'offline';
    }
    return getDeviceStatus(deviceId, currentReading.value, deviceInfo.thresholds);
  }, [deviceId, currentReading, deviceInfo.thresholds]);

  const statusColor = getStatusColor(deviceStatus);

  if (!device && !currentReading) {
    return (
      <div className="device-card device-card--loading">
        <div className="device-card__header">
          <div className="loading-spinner loading-spinner--sm"></div>
          <span className="device-card__loading-text">Loading device...</span>
        </div>
        <style jsx>{getStyles()}</style>
      </div>
    );
  }

  return (
    <div className={`device-card device-card--${deviceStatus}`}>
      <div className="device-card__header">
        <div className="device-card__info">
          <h3 className="device-card__title">{deviceInfo.name}</h3>
          <span className="device-card__id">{deviceId}</span>
          <span className="device-card__location">{deviceInfo.location}</span>
        </div>
        <div className={`device-card__status device-card__status--${deviceStatus}`}>
          <div className="device-card__status-indicator"></div>
          <span className="device-card__status-text">
            {getStatusText(deviceStatus)}
          </span>
        </div>
      </div>

      <div className="device-card__content">
        <div className="device-card__value-section">
          <div className="device-card__current-value">
            <span className="device-card__value">
              {formatValue(currentReading?.value || 0)}
            </span>
            <span className="device-card__unit">{deviceInfo.unit}</span>
          </div>
          
          <div className="device-card__gauge">
            <div className="gauge">
              <div className="gauge__track">
                <div 
                  className="gauge__fill" 
                  style={{
                    '--gauge-percentage': `${getGaugePercentage(currentReading?.value, deviceInfo.thresholds)}%`,
                    '--gauge-color': statusColor
                  }}
                ></div>
              </div>
              <div className="gauge__labels">
                <span className="gauge__min">
                  {formatValue(deviceInfo.thresholds.normalMin || 0)}
                </span>
                <span className="gauge__max">
                  {formatValue(deviceInfo.thresholds.normalMax || 100)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="device-card__details">
          <div className="device-card__thresholds">
            <div className="threshold">
              <span className="threshold__label">Normal Range:</span>
              <span className="threshold__value">
                {formatThresholdRange(
                  deviceInfo.thresholds.normalMin, 
                  deviceInfo.thresholds.normalMax, 
                  deviceInfo.unit
                )}
              </span>
            </div>
            
            {(deviceInfo.thresholds.alertMin || deviceInfo.thresholds.alertMax) && (
              <div className="threshold threshold--alert">
                <span className="threshold__label">Alert Limits:</span>
                <span className="threshold__value">
                  {deviceInfo.thresholds.alertMin && `< ${formatValue(deviceInfo.thresholds.alertMin)}`}
                  {deviceInfo.thresholds.alertMin && deviceInfo.thresholds.alertMax && ' | '}
                  {deviceInfo.thresholds.alertMax && `> ${formatValue(deviceInfo.thresholds.alertMax)}`}
                  {' ' + deviceInfo.unit}
                </span>
              </div>
            )}
          </div>

          <div className="device-card__timestamp">
            <span className="timestamp__label">Last update:</span>
            <span className="timestamp__value">
              {currentReading?.timestamp ? 
                formatRelativeTime(currentReading.timestamp) : 'Never'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{getStyles()}</style>
    </div>
  );
};

// Helper function to calculate gauge percentage
const getGaugePercentage = (value, thresholds) => {
  if (!value && value !== 0) return 0;
  
  const min = thresholds.normalMin || 0;
  const max = thresholds.normalMax || 100;
  const range = max - min;
  
  if (range <= 0) return 0;
  
  const percentage = ((value - min) / range) * 100;
  return Math.max(0, Math.min(100, percentage));
};

// Styles function
const getStyles = () => `
  .device-card {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    box-shadow: var(--shadow);
    overflow: hidden;
    transition: all var(--transition-normal);
    position: relative;
  }

  .device-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .device-card--loading {
    opacity: 0.7;
  }

  .device-card--normal {
    border-left: 4px solid var(--color-success);
  }

  .device-card--warning_high,
  .device-card--warning_low {
    border-left: 4px solid var(--color-warning);
  }

  .device-card--critical_high,
  .device-card--critical_low {
    border-left: 4px solid var(--color-error);
  }

  .device-card--offline {
    border-left: 4px solid var(--color-gray-400);
    opacity: 0.7;
  }

  .device-card__header {
    padding: var(--spacing-4) var(--spacing-5);
    border-bottom: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-3);
  }

  .device-card__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .device-card__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .device-card__id {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-medium);
  }

  .device-card__location {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .device-card__status {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    border-radius: var(--radius);
    border: 1px solid;
    white-space: nowrap;
  }

  .device-card__status--normal {
    border-color: var(--color-success);
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
  }

  .device-card__status--warning_high,
  .device-card__status--warning_low {
    border-color: var(--color-warning);
    background: rgba(245, 158, 11, 0.1);
    color: var(--color-warning);
  }

  .device-card__status--critical_high,
  .device-card__status--critical_low {
    border-color: var(--color-error);
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
  }

  .device-card__status--offline {
    border-color: var(--color-gray-400);
    background: rgba(107, 114, 128, 0.1);
    color: var(--color-gray-400);
  }

  .device-card__status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }

  .device-card__status--normal .device-card__status-indicator {
    animation: pulse 2s infinite;
  }

  .device-card__status-text {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .device-card__content {
    padding: var(--spacing-5);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .device-card__value-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-4);
  }

  .device-card__current-value {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-2);
  }

  .device-card__value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: 1;
  }

  .device-card__unit {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .device-card__gauge {
    flex: 1;
    max-width: 120px;
  }

  .gauge {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .gauge__track {
    height: 8px;
    background: var(--color-gray-200);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
  }

  .gauge__fill {
    height: 100%;
    background: var(--gauge-color, var(--color-primary));
    width: var(--gauge-percentage, 0%);
    border-radius: var(--radius-full);
    transition: all var(--transition-normal);
  }

  .gauge__labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .device-card__details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .device-card__thresholds {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .threshold {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .threshold__label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .threshold__value {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .threshold--alert .threshold__label {
    color: var(--color-warning);
  }

  .threshold--alert .threshold__value {
    color: var(--color-warning);
  }

  .device-card__timestamp {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
    padding-top: var(--spacing-2);
    border-top: 1px solid var(--color-border-light);
  }

  .timestamp__label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .timestamp__value {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .device-card__loading-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .device-card__header {
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .device-card__value-section {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-3);
    }

    .device-card__gauge {
      width: 100%;
      max-width: none;
    }

    .device-card__value {
      font-size: var(--font-size-2xl);
    }
  }
`;

export default DeviceCard;
