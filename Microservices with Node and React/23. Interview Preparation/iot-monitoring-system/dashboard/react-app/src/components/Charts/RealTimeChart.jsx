import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDeviceHistory, selectHistoricalData } from '../../store/slices/devicesSlice';

const RealTimeChart = ({ 
  deviceId, 
  height = 300, 
  timeRange = '1h',
  title,
  unit = '',
  showControls = true 
}) => {
  const dispatch = useDispatch();
  const historicalData = useSelector(selectHistoricalData(deviceId));
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch historical data on mount and when timeRange changes
  useEffect(() => {
    if (deviceId) {
      dispatch(fetchDeviceHistory({ 
        deviceId, 
        timeRange: selectedTimeRange, 
        points: 100 
      }));
    }
  }, [dispatch, deviceId, selectedTimeRange]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (deviceId) {
        dispatch(fetchDeviceHistory({ 
          deviceId, 
          timeRange: selectedTimeRange, 
          points: 100 
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, deviceId, selectedTimeRange, autoRefresh]);

  // Process data for Plotly
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    const timestamps = historicalData.map(point => new Date(point.timestamp));
    const values = historicalData.map(point => point.value);

    return [{
      x: timestamps,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      name: `${deviceId} ${unit}`,
      line: {
        color: '#3b82f6',
        width: 2
      },
      marker: {
        color: '#3b82f6',
        size: 4
      },
      hovertemplate: `<b>%{y}${unit}</b><br>` +
                     '%{x}<br>' +
                     '<extra></extra>'
    }];
  }, [historicalData, deviceId, unit]);

  const layout = {
    title: {
      text: title || `${deviceId} - Real-time Data`,
      font: { size: 16, color: '#1f2937' }
    },
    xaxis: {
      title: 'Time',
      type: 'date',
      tickformat: '%H:%M:%S',
      gridcolor: '#e5e7eb',
      tickfont: { size: 12, color: '#6b7280' }
    },
    yaxis: {
      title: `Value ${unit ? `(${unit})` : ''}`,
      gridcolor: '#e5e7eb',
      tickfont: { size: 12, color: '#6b7280' }
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: { family: 'Inter, system-ui, sans-serif' },
    margin: { l: 60, r: 40, t: 60, b: 60 },
    showlegend: false,
    hovermode: 'x unified'
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

  const timeRangeOptions = [
    { value: '15m', label: '15 min' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' }
  ];

  return (
    <div className="chart-container">
      {showControls && (
        <div className="chart-controls" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px',
          padding: '0 10px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#6b7280' }}>Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#6b7280' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Auto-refresh
            </label>
            
            <button
              onClick={() => dispatch(fetchDeviceHistory({ 
                deviceId, 
                timeRange: selectedTimeRange, 
                points: 100 
              }))}
              style={{
                padding: '4px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      )}
      
      <Plot
        data={chartData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: `${height}px` }}
        useResizeHandler={true}
      />
      
      {(!historicalData || historicalData.length === 0) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <div>No historical data available</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Data will appear once the device starts sending readings
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeChart;
