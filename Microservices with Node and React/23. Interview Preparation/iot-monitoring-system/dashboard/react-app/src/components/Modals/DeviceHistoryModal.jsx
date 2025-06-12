import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentReadingById,
  fetchDeviceHistory 
} from '../../store/slices/devicesSlice';
import { 
  getDeviceName,
  getDeviceUnit,
  formatValue 
} from '../../utils/formatters';
import { RealTimeChart } from '../Charts';

const DeviceHistoryModal = ({ deviceId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const currentReading = useSelector(selectCurrentReadingById(deviceId));
  
  const [timeRange, setTimeRange] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);

  const deviceName = getDeviceName(deviceId);
  const deviceUnit = getDeviceUnit(deviceId);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Load historical data when modal opens
  useEffect(() => {
    if (isOpen && deviceId) {
      setIsLoading(true);
      dispatch(fetchDeviceHistory({ 
        deviceId, 
        timeRange, 
        points: 100 
      })).finally(() => {
        setIsLoading(false);
      });
    }
  }, [dispatch, deviceId, isOpen, timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    if (deviceId) {
      setIsLoading(true);
      dispatch(fetchDeviceHistory({ 
        deviceId, 
        timeRange: newTimeRange, 
        points: 100 
      })).finally(() => {
        setIsLoading(false);
      });
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Historical Data</h2>
            <div className="modal-subtitle">
              <span className="device-name">{deviceName}</span>
              <span className="device-id">({deviceId})</span>
            </div>
          </div>
          
          <div className="modal-controls">
            {/* Current Value Display */}
            <div className="current-value-display">
              <div className="current-label">Current:</div>
              <div className="current-value">
                {formatValue(currentReading?.value || 0)} {deviceUnit}
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="time-range-selector">
              <label htmlFor="timeRange">Time Range:</label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="time-range-select"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
            </div>

            {/* Close Button */}
            <button className="close-button" onClick={onClose} title="Close (ESC)">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading historical data...</div>
            </div>
          ) : (
            <div className="chart-container">
              <RealTimeChart
                deviceId={deviceId}
                height={400}
                timeRange={timeRange}
                title={`${deviceName} Historical Trends`}
                unit={deviceUnit}
                showControls={false}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span className="info-text">
              Press <kbd>ESC</kbd> to close • Data updates in real-time
            </span>
          </div>
          <div className="footer-actions">
            <button className="action-button secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="action-button primary"
              onClick={() => handleTimeRangeChange(timeRange)}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{getModalStyles()}</style>
    </div>
  );

  // Render modal in portal to ensure proper z-index layering
  return createPortal(modalContent, document.body);
};

// Modal styles
const getModalStyles = () => `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-4);
    backdrop-filter: blur(4px);
  }

  .modal-container {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modalEnter 0.2s ease-out;
  }

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    padding: var(--spacing-6);
    border-bottom: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-4);
  }

  .modal-title-section {
    flex: 1;
  }

  .modal-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-1) 0;
  }

  .modal-subtitle {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .device-name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
  }

  .device-id {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  .modal-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
  }

  .current-value-display {
    text-align: right;
  }

  .current-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-1);
  }

  .current-value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
    font-family: var(--font-mono);
  }

  .time-range-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .time-range-selector label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .time-range-select {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    background: var(--color-bg-primary);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    min-width: 140px;
  }

  .time-range-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .close-button {
    padding: var(--spacing-2);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--font-size-lg);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
  }

  .close-button:hover {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }

  .modal-body {
    flex: 1;
    padding: var(--spacing-6);
    overflow: auto;
    min-height: 400px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: var(--spacing-4);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
  }

  .chart-container {
    height: 100%;
    min-height: 400px;
  }

  .modal-footer {
    padding: var(--spacing-4) var(--spacing-6);
    border-top: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-4);
  }

  .footer-info {
    flex: 1;
  }

  .info-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  kbd {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: var(--font-size-xs);
    font-family: var(--font-mono);
  }

  .footer-actions {
    display: flex;
    gap: var(--spacing-3);
  }

  .action-button {
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid;
    min-width: 100px;
  }

  .action-button.secondary {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-light);
    color: var(--color-text-secondary);
  }

  .action-button.secondary:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border);
  }

  .action-button.primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .action-button.primary:hover:not(:disabled) {
    background: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: var(--spacing-2);
    }

    .modal-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-3);
    }

    .modal-controls {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .modal-footer {
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .footer-actions {
      width: 100%;
      justify-content: stretch;
    }

    .action-button {
      flex: 1;
    }
  }

  @media (max-width: 480px) {
    .modal-container {
      max-height: 95vh;
    }

    .modal-body {
      padding: var(--spacing-4);
    }

    .chart-container {
      min-height: 300px;
    }
  }
`;

export default DeviceHistoryModal;
