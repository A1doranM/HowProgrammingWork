import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectSystemHealth, 
  selectSystemMetrics 
} from '../../store/slices/systemSlice';
import { 
  selectConnectionStatus 
} from '../../store/slices/devicesSlice';
import { 
  formatUptime, 
  formatValue 
} from '../../utils/formatters';

const SystemHealth = () => {
  const systemHealth = useSelector(selectSystemHealth);
  const systemMetrics = useSelector(selectSystemMetrics);
  const connectionStatus = useSelector(selectConnectionStatus);

  const getHealthStatus = () => {
    if (connectionStatus === 'disconnected') return 'error';
    if (systemHealth.status === 'healthy') return 'success';
    if (systemHealth.status === 'degraded') return 'warning';
    return 'error';
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="system-health">
      <div className="system-health__header">
        <h2 className="system-health__title">System Health</h2>
        <div className={`system-health__status system-health__status--${healthStatus}`}>
          <div className="system-health__status-indicator"></div>
          <span className="system-health__status-text">
            {connectionStatus === 'disconnected' ? 'Disconnected' : systemHealth.status || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="system-health__content">
        <div className="system-health__metrics">
          <div className="metric">
            <div className="metric__icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="metric__content">
              <div className="metric__value">{systemMetrics.activeDevices || 0}</div>
              <div className="metric__label">Active Devices</div>
            </div>
          </div>

          <div className="metric">
            <div className="metric__icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="metric__content">
              <div className="metric__value">{formatValue(systemMetrics.dataPointsLastHour || 0, 0)}</div>
              <div className="metric__label">Data Points/Hour</div>
            </div>
          </div>

          <div className="metric">
            <div className="metric__icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <div className="metric__content">
              <div className="metric__value">{systemMetrics.activeAlertsCount || 0}</div>
              <div className="metric__label">Active Alerts</div>
            </div>
          </div>

          <div className="metric">
            <div className="metric__icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="metric__content">
              <div className="metric__value">{formatUptime(systemHealth.uptime || 0)}</div>
              <div className="metric__label">System Uptime</div>
            </div>
          </div>
        </div>

        {systemHealth.services && Object.keys(systemHealth.services).length > 0 && (
          <div className="system-health__services">
            <h3 className="system-health__services-title">Service Status</h3>
            <div className="services-grid">
              {Object.entries(systemHealth.services).map(([serviceName, service]) => (
                <div key={serviceName} className="service">
                  <div className={`service__status service__status--${service.status}`}>
                    <div className="service__status-indicator"></div>
                  </div>
                  <div className="service__content">
                    <div className="service__name">{serviceName}</div>
                    <div className="service__details">
                      <span className="service__response-time">
                        {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .system-health {
          background: var(--color-bg-primary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .system-health__header {
          padding: var(--spacing-4) var(--spacing-6);
          border-bottom: 1px solid var(--color-border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-bg-tertiary);
        }

        .system-health__title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .system-health__status {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-3);
          border-radius: var(--radius);
          border: 1px solid;
        }

        .system-health__status--success {
          border-color: var(--color-success);
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .system-health__status--warning {
          border-color: var(--color-warning);
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }

        .system-health__status--error {
          border-color: var(--color-error);
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .system-health__status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .system-health__status--success .system-health__status-indicator {
          animation: pulse 2s infinite;
        }

        .system-health__status-text {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          text-transform: capitalize;
        }

        .system-health__content {
          padding: var(--spacing-6);
        }

        .system-health__metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-6);
        }

        .metric {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-4);
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
        }

        .metric__icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-primary);
          color: white;
          border-radius: var(--radius-lg);
        }

        .metric__icon svg {
          width: 20px;
          height: 20px;
        }

        .metric__content {
          flex: 1;
        }

        .metric__value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          line-height: 1;
        }

        .metric__label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-top: var(--spacing-1);
        }

        .system-health__services {
          border-top: 1px solid var(--color-border-light);
          padding-top: var(--spacing-6);
        }

        .system-health__services-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0 0 var(--spacing-4) 0;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--spacing-3);
        }

        .service {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-3);
          background: var(--color-bg-secondary);
          border-radius: var(--radius);
          border: 1px solid var(--color-border-light);
        }

        .service__status {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service__status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .service__status--healthy .service__status-indicator {
          background-color: var(--color-success);
        }

        .service__status--degraded .service__status-indicator {
          background-color: var(--color-warning);
        }

        .service__status--error .service__status-indicator {
          background-color: var(--color-error);
        }

        .service__content {
          flex: 1;
        }

        .service__name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          text-transform: capitalize;
        }

        .service__details {
          margin-top: var(--spacing-1);
        }

        .service__response-time {
          font-size: var(--font-size-xs);
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
        @media (max-width: 768px) {
          .system-health__header {
            flex-direction: column;
            gap: var(--spacing-3);
            text-align: center;
          }

          .system-health__metrics {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--spacing-3);
          }

          .metric {
            padding: var(--spacing-3);
          }

          .metric__icon {
            width: 32px;
            height: 32px;
          }

          .metric__icon svg {
            width: 16px;
            height: 16px;
          }

          .metric__value {
            font-size: var(--font-size-lg);
          }
        }

        @media (max-width: 480px) {
          .system-health__content {
            padding: var(--spacing-4);
          }

          .system-health__metrics {
            grid-template-columns: 1fr;
            gap: var(--spacing-2);
          }

          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemHealth;
