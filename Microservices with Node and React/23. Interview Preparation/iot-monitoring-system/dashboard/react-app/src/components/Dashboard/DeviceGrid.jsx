import React from 'react';
import { useSelector } from 'react-redux';
import DeviceCard from './DeviceCard';
import { selectDevices } from '../../store/slices/devicesSlice';
import { DEVICE_IDS } from '../../utils/constants';

const DeviceGrid = () => {
  const devices = useSelector(selectDevices);

  return (
    <div className="device-grid">
      <div className="device-grid__header">
        <h2 className="device-grid__title">Device Status Overview</h2>
        <div className="device-grid__stats">
          <div className="device-grid__stat">
            <span className="device-grid__stat-value">{DEVICE_IDS.length}</span>
            <span className="device-grid__stat-label">Total Devices</span>
          </div>
          <div className="device-grid__stat">
            <span className="device-grid__stat-value">
              {Object.values(devices).filter(device => device?.status === 'active').length}
            </span>
            <span className="device-grid__stat-label">Active</span>
          </div>
        </div>
      </div>
      
      <div className="device-grid__container">
        {DEVICE_IDS.map(deviceId => (
          <DeviceCard key={deviceId} deviceId={deviceId} />
        ))}
      </div>

      <style jsx>{`
        .device-grid {
          background: var(--color-bg-primary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .device-grid__header {
          padding: var(--spacing-4) var(--spacing-6);
          border-bottom: 1px solid var(--color-border-light);
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .device-grid__title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .device-grid__stats {
          display: flex;
          gap: var(--spacing-6);
        }

        .device-grid__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-1);
        }

        .device-grid__stat-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
        }

        .device-grid__stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .device-grid__container {
          padding: var(--spacing-6);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-6);
          max-width: 100%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .device-grid__header {
            flex-direction: column;
            gap: var(--spacing-4);
            text-align: center;
          }

          .device-grid__stats {
            gap: var(--spacing-4);
          }

          .device-grid__container {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--spacing-4);
            padding: var(--spacing-4);
          }
        }

        @media (max-width: 480px) {
          .device-grid__container {
            grid-template-columns: 1fr;
            gap: var(--spacing-3);
            padding: var(--spacing-3);
          }

          .device-grid__stats {
            flex-direction: column;
            gap: var(--spacing-2);
          }

          .device-grid__stat {
            flex-direction: row;
            gap: var(--spacing-2);
          }
        }

        /* Grid layout optimization - Maximum 3 cards per row */
        @media (min-width: 769px) {
          .device-grid__container {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            max-width: 100%;
          }
        }

        @media (min-width: 1200px) {
          .device-grid__container {
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          }
        }

        /* Prevent more than 3 columns on very wide screens */
        @media (min-width: 1400px) {
          .device-grid__container {
            grid-template-columns: repeat(3, 1fr);
            max-width: 1200px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceGrid;
