import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

const GaugeChart = ({ 
  value, 
  min = 0, 
  max = 100, 
  unit = '', 
  title = '',
  thresholds = {},
  height = 250 
}) => {
  const gaugeData = useMemo(() => {
    const normalMin = thresholds.normalMin || min;
    const normalMax = thresholds.normalMax || max;
    const alertMin = thresholds.alertMin || min - 10;
    const alertMax = thresholds.alertMax || max + 10;

    // Determine color based on value and thresholds
    let gaugeColor = '#22c55e'; // Green (normal)
    if (value < normalMin || value > normalMax) {
      gaugeColor = '#f59e0b'; // Orange (warning)
    }
    if (value < alertMin || value > alertMax) {
      gaugeColor = '#ef4444'; // Red (critical)
    }

    return [{
      type: "indicator",
      mode: "gauge+number",
      value: value || 0,
      domain: { x: [0, 1], y: [0, 1] },
      title: { 
        text: title,
        font: { size: 16, color: '#1f2937' }
      },
      number: { 
        suffix: unit,
        font: { size: 20, color: '#1f2937' }
      },
      gauge: {
        axis: { 
          range: [min, max],
          tickfont: { size: 12, color: '#6b7280' }
        },
        bar: { color: gaugeColor, thickness: 0.3 },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "#e5e7eb",
        steps: [
          { range: [min, normalMin], color: "#fee2e2" }, // Light red
          { range: [normalMin, normalMax], color: "#dcfce7" }, // Light green
          { range: [normalMax, max], color: "#fef3c7" } // Light yellow
        ],
        threshold: {
          line: { color: gaugeColor, width: 4 },
          thickness: 0.75,
          value: value || 0
        }
      }
    }];
  }, [value, min, max, unit, title, thresholds]);

  const layout = {
    width: 300,
    height: height,
    margin: { t: 40, b: 20, l: 20, r: 20 },
    paper_bgcolor: "white",
    font: { 
      family: 'Inter, system-ui, sans-serif',
      color: '#1f2937'
    }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <div className="gauge-chart" style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center' 
    }}>
      <Plot
        data={gaugeData}
        layout={layout}
        config={config}
        useResizeHandler={true}
      />
    </div>
  );
};

export default GaugeChart;
