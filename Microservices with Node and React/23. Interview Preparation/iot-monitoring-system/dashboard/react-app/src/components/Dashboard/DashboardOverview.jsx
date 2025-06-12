import React from 'react';
import Header from '../Layout/Header';
import DeviceGrid from './DeviceGrid';
import SystemHealth from './SystemHealth';

const DashboardOverview = () => {
  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard__main">
        <div className="dashboard__container">
          <SystemHealth />
          <DeviceGrid />
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-bg-secondary);
        }

        .dashboard__main {
          flex: 1;
          padding: var(--spacing-6);
        }

        .dashboard__container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-6);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard__main {
            padding: var(--spacing-4);
          }

          .dashboard__container {
            gap: var(--spacing-4);
          }
        }

        @media (max-width: 480px) {
          .dashboard__main {
            padding: var(--spacing-3);
          }

          .dashboard__container {
            gap: var(--spacing-3);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
