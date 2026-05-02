import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

/**
 * TemperatureChart — Chart.js line chart showing 5-day temperature trend.
 * Renders high/low as two filled areas for a nice visual.
 */
export default function TemperatureChart({ data, unit }) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labels = data.map((d, i) => {
    if (i === 0) return 'Today';
    return dayNames[new Date(d.date + 'T00:00:00').getDay()];
  });
  const highs = data.map(d => unit === 'C' ? d.maxtemp_c : d.maxtemp_f);
  const lows = data.map(d => unit === 'C' ? d.mintemp_c : d.mintemp_f);

  const chartData = {
    labels,
    datasets: [
      {
        label: `High (°${unit})`,
        data: highs,
        borderColor: 'rgba(255,152,0,0.9)',
        backgroundColor: 'rgba(255,152,0,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(255,152,0,1)',
      },
      {
        label: `Low (°${unit})`,
        data: lows,
        borderColor: 'rgba(79,195,247,0.9)',
        backgroundColor: 'rgba(79,195,247,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(79,195,247,1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Inter' } } },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)', callback: v => `${v}°` }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  return (
    <div className="chart-section glass-card">
      <h2>📈 Temperature Trend</h2>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
