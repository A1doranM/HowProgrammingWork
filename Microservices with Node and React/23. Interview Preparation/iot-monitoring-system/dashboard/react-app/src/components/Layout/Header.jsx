import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectLastUpdate, 
  selectConnectionStatus 
} from '../../store/slices/devicesSlice';
import { 
  selectSystemMetrics 
} from '../../store/slices/systemSlice';
import { 
  formatConnectionStatus, 
  formatRelativeTime 
} from '../../utils/formatters';
import { DEVICE_IDS } from '../../utils/constants';

const Header = () => {
  const lastUpdate = useSelector(selectLastUpdate);
  const connectionStatus = useSelector(selectConnectionStatus);
  const systemMetrics = useSelector(selectSystemMetrics);

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__branding">
          <h1 className="header__title">IoT Monitoring Dashboard</h1>
          <span className="header__subtitle">Real-time Industrial Monitoring</span>
        </div>
        
        <div className="header__info">
          <div className="header__stats">
            <div className="header__stat">
              <span className="header__stat-value">{DEVICE_IDS.length}</span>
              <span className="header__stat-label">Total Devices</span>
            </div>
            <div className="header__stat">
              <span className="header__stat-value">{systemMetrics.activeDevices || 0}</span>
              <span className="header__stat-label">Active</span>
            </div>
            <div className="header__stat">
              <span className="header__stat-value">{systemMetrics.activeAlertsCount || 0}</span>
              <span className="header__stat-label">Alerts</span>
            </div>
          </div>
          
          <div className="header__status">
            <div className={`connection-status connection-status--${connectionStatus}`}>
              <div className={`connection-status__indicator connection-status__indicator--${connectionStatus}`}></div>
              <span className="connection-status__text">
                {formatConnectionStatus(connectionStatus)}
              </span>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="header__last-update">
              <span className="header__last-update-label">Last update:</span>
              <span className="header__last-update-time">
                {formatRelativeTime(lastUpdate)}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          background: var(--color-bg-primary);
          border-bottom: 1px solid var(--color-border-light);
          padding: var(--spacing-4) var(--spacing-6);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header__content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header__branding {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
        }

        .header__title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .header__subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: var(--font-weight-medium);
        }

        .header__info {
          display: flex;
          align-items: center;
          gap: var(--spacing-8);
        }

        .header__stats {
          display: flex;
          gap: var(--spacing-6);
        }

        .header__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-1);
        }

        .header__stat-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
        }

        .header__stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .header__status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-2);
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-3);
          border-radius: var(--radius);
          border: 1px solid var(--color-border-light);
          background: var(--color-bg-secondary);
        }

        .connection-status--connected {
          border-color: var(--color-success);
          background: rgba(16, 185, 129, 0.1);
        }

        .connection-status--connecting {
          border-color: var(--color-warning);
          background: rgba(245, 158, 11, 0.1);
        }

        .connection-status--disconnected {
          border-color: var(--color-error);
          background: rgba(239, 68, 68, 0.1);
        }

        .connection-status__indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .connection-status__indicator--connected {
          background-color: var(--color-success);
          animation: pulse 2s infinite;
        }

        .connection-status__indicator--connecting {
          background-color: var(--color-warning);
          animation: pulse 1s infinite;
        }

        .connection-status__indicator--disconnected {
          background-color: var(--color-error);
        }

        .connection-status__text {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }

        .connection-status--connected .connection-status__text {
          color: var(--color-success);
        }

        .connection-status--connecting .connection-status__text {
          color: var(--color-warning);
        }

        .connection-status--disconnected .connection-status__text {
          color: var(--color-error);
        }

        .header__last-update {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-1);
        }

        .header__last-update-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: var(--font-weight-medium);
        }

        .header__last-update-time {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          font-weight: var(--font-weight-medium);
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
          .header {
            padding: var(--spacing-3) var(--spacing-4);
          }

          .header__content {
            flex-direction: column;
            gap: var(--spacing-4);
          }

          .header__title {
            font-size: var(--font-size-xl);
            text-align: center;
          }

          .header__subtitle {
            text-align: center;
          }

          .header__info {
            gap: var(--spacing-4);
            flex-wrap: wrap;
            justify-content: center;
          }

          .header__stats {
            gap: var(--spacing-4);
          }

          .header__stat-value {
            font-size: var(--font-size-lg);
          }
        }

        @media (max-width: 480px) {
          .header__stats {
            flex-direction: column;
            gap: var(--spacing-2);
          }

          .header__stat {
            flex-direction: row;
            gap: var(--spacing-2);
          }

          .header__info {
            flex-direction: column;
            gap: var(--spacing-3);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
