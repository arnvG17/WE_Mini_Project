import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

/**
 * TrendChart — Enhanced chart component that supports switching between 
 * different weather attributes like Temperature, Humidity, Wind, etc.
 */
export default function TrendChart({ data, unit }) {
  const [activeMetric, setActiveMetric] = useState('temp'); // temp | humidity | wind | visibility | uv

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labels = data.map((d, i) => {
    if (i === 0) return 'Today';
    return dayNames[new Date(d.date + 'T00:00:00').getDay()];
  });

  const getMetricData = () => {
    switch (activeMetric) {
      case 'temp':
        return {
          datasets: [
            {
              label: `High (°${unit})`,
              data: data.map(d => unit === 'C' ? d.maxtemp_c : d.maxtemp_f),
              borderColor: 'rgba(212, 145, 94, 0.9)',
              backgroundColor: 'rgba(212, 145, 94, 0.15)',
              fill: true,
              tension: 0.4,
            },
            {
              label: `Low (°${unit})`,
              data: data.map(d => unit === 'C' ? d.mintemp_c : d.mintemp_f),
              borderColor: 'rgba(125, 175, 201, 0.9)',
              backgroundColor: 'rgba(125, 175, 201, 0.15)',
              fill: true,
              tension: 0.4,
            }
          ]
        };
      case 'humidity':
        return {
          datasets: [{
            label: 'Avg Humidity (%)',
            data: data.map(d => d.avghumidity),
            borderColor: 'rgba(125, 175, 201, 0.9)',
            backgroundColor: 'rgba(125, 175, 201, 0.15)',
            fill: true,
            tension: 0.4,
          }]
        };
      case 'wind':
        return {
          datasets: [{
            label: `Max Wind (${unit === 'C' ? 'kph' : 'mph'})`,
            data: data.map(d => unit === 'C' ? d.maxwind_kph : d.maxwind_mph),
            borderColor: 'rgba(168, 151, 140, 0.9)',
            backgroundColor: 'rgba(168, 151, 140, 0.15)',
            fill: true,
            tension: 0.4,
          }]
        };
      case 'visibility':
        return {
          datasets: [{
            label: 'Avg Visibility (km)',
            data: data.map(d => d.avgvis_km),
            borderColor: 'rgba(168, 162, 158, 0.9)',
            backgroundColor: 'rgba(168, 162, 158, 0.15)',
            fill: true,
            tension: 0.4,
          }]
        };
      case 'uv':
        return {
          datasets: [{
            label: 'UV Index',
            data: data.map(d => d.uv),
            borderColor: 'rgba(212, 145, 94, 0.9)',
            backgroundColor: 'rgba(212, 145, 94, 0.15)',
            fill: true,
            tension: 0.4,
          }]
        };
      default:
        return { datasets: [] };
    }
  };

  const chartData = {
    labels,
    ...getMetricData()
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: activeMetric === 'temp',
        labels: { 
          color: 'rgba(231, 224, 216, 0.7)', 
          font: { family: 'DM Sans', size: 12 } 
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(28, 25, 23, 0.9)',
        titleFont: { family: 'DM Serif Display', size: 14 },
        bodyFont: { family: 'DM Sans', size: 13 },
        borderColor: 'rgba(245, 230, 210, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { 
        ticks: { color: 'rgba(231, 224, 216, 0.5)', font: { family: 'DM Sans' } }, 
        grid: { color: 'rgba(245, 230, 210, 0.05)' } 
      },
      y: { 
        ticks: { color: 'rgba(231, 224, 216, 0.5)', font: { family: 'DM Sans' } }, 
        grid: { color: 'rgba(245, 230, 210, 0.05)' } 
      },
    },
  };

  const metrics = [
    { id: 'temp', label: 'Temperature' },
    { id: 'humidity', label: 'Humidity' },
    { id: 'wind', label: 'Wind' },
    { id: 'visibility', label: 'Visibility' },
    { id: 'uv', label: 'UV Index' },
  ];

  return (
    <div className="chart-section glass-card">
      <div className="chart-header">
        <h2>Weather Trends</h2>
        <div className="metric-selector">
          {metrics.map(m => (
            <button 
              key={m.id}
              className={`metric-btn ${activeMetric === m.id ? 'active' : ''}`}
              onClick={() => setActiveMetric(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
