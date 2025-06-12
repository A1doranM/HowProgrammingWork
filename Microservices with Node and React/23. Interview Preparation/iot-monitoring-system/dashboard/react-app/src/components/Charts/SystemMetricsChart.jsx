import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useSelector } from 'react-redux';
import { selectSystemMetrics } from '../../store/slices/systemSlice';

const SystemMetricsChart = ({ height = 400 }) => {
  const metrics = useSelector(selectSystemMetrics);

  const chartData = useMemo(() => {
    const data = [
      {
        x: ['Active Devices', 'Total Devices', 'Data Points/Hour', 'Active Alerts'],
        y: [
          metrics.activeDevices || 0,
          metrics.totalDevices || 0,
          metrics.dataPointsLastHour || 0,
          metrics.activeAlertsCount || 0
        ],
        type: 'bar',
        name: 'System Metrics',
        marker: {
          color: [
            '#22c55e', // Green for active devices
            '#3b82f6', // Blue for total devices
            '#8b5cf6', // Purple for data points
            '#ef4444'  // Red for alerts
          ],
          opacity: 0.8
        },
        text: [
          metrics.activeDevices || 0,
          metrics.totalDevices || 0,
          metrics.dataPointsLastHour || 0,
          metrics.activeAlertsCount || 0
        ],
        textposition: 'outside',
        textfont: {
          size: 14,
          color: '#1f2937'
        }
      }
    ];

    return data;
  }, [metrics]);

  const layout = {
    title: {
      text: 'System Overview Metrics',
      font: { size: 18, color: '#1f2937' }
    },
    xaxis: {
      title: 'Metrics',
      tickfont: { size: 12, color: '#6b7280' },
      gridcolor: '#f3f4f6'
    },
    yaxis: {
      title: 'Count',
      tickfont: { size: 12, color: '#6b7280' },
      gridcolor: '#f3f4f6'
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: { family: 'Inter, system-ui, sans-serif' },
    margin: { l: 60, r: 40, t: 80, b: 100 },
    showlegend: false,
    bargap: 0.3
  };

  const config = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
      'pan2d', 'select2d', 'lasso2d', 'resetScale2d',
      'zoomOut2d', 'toggleHover', 'sendDataToCloud'
    ],
    displaylogo: false,
    responsive: true
  };

  return (
    <div className="system-metrics-chart">
      <Plot
        data={chartData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: `${height}px` }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default SystemMetricsChart;
