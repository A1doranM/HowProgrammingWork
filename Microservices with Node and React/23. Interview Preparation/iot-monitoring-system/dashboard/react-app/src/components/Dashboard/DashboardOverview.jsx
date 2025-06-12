import React from 'react';
import Header from '../Layout/Header';
import DeviceGrid from './DeviceGrid';
import SystemHealth from './SystemHealth';
import { SystemMetricsChart } from '../Charts';

const DashboardOverview = () => {
  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard__main">
        <div className="dashboard__container">
          <SystemHealth />
          
          {/* System Analytics Chart */}
          <section className="analytics-section">
            <h2 className="analytics-title">System Analytics</h2>
            <div className="analytics-chart-container">
              <SystemMetricsChart 
                height={300}
                title="Real-time System Metrics"
                showControls={true}
              />
            </div>
          </section>
          
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

        .analytics-section {
          background: var(--color-bg-primary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-light);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .analytics-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
          padding: var(--spacing-5) var(--spacing-6);
          background: var(--color-bg-tertiary);
          border-bottom: 1px solid var(--color-border-light);
        }

        .analytics-chart-container {
          padding: var(--spacing-6);
          min-height: 300px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard__main {
            padding: var(--spacing-4);
          }

          .dashboard__container {
            gap: var(--spacing-4);
          }

          .analytics-title {
            font-size: var(--font-size-lg);
            padding: var(--spacing-4) var(--spacing-5);
          }

          .analytics-chart-container {
            padding: var(--spacing-4);
            min-height: 250px;
          }
        }

        @media (max-width: 480px) {
          .dashboard__main {
            padding: var(--spacing-3);
          }

          .dashboard__container {
            gap: var(--spacing-3);
          }

          .analytics-title {
            font-size: var(--font-size-base);
            padding: var(--spacing-3) var(--spacing-4);
          }

          .analytics-chart-container {
            padding: var(--spacing-3);
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
