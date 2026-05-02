import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * HistoryComparison — Date picker + side-by-side comparison of current vs historical weather.
 * Fetches history data independently when the user picks a date.
 */
export default function HistoryComparison({ currentData, city, unit }) {
  const [date, setDate] = useState('');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    if (!date) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE}/history/${encodeURIComponent(city)}?date=${date}`);
      setHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch history');
      setHistory(null);
    }
    setLoading(false);
  };

  // Limit date picker to past dates (WeatherAPI free tier: last 7 days usually)
  const today = new Date().toISOString().split('T')[0];

  const fmt = (c, f) => unit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
  const fmtWind = (kph, mph) => unit === 'C' ? `${kph} km/h` : `${mph} mph`;

  return (
    <div className="history-section glass-card">
      <h2><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:'8px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Historical Comparison</h2>
      <div className="history-controls">
        <input
          id="history-date"
          className="date-input"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          id="history-btn"
          className="history-btn"
          onClick={fetchHistory}
          disabled={!date || loading}
        >
          {loading ? 'Loading...' : 'Compare'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {history && currentData && (
        <div className="comparison-grid">
          <div className="comparison-card">
            <h3>Today</h3>
            <div className="comp-row"><span className="comp-label">Temp</span><span>{fmt(currentData.current.temp_c, currentData.current.temp_f)}</span></div>
            <div className="comp-row"><span className="comp-label">Feels Like</span><span>{fmt(currentData.current.feelslike_c, currentData.current.feelslike_f)}</span></div>
            <div className="comp-row"><span className="comp-label">Humidity</span><span>{currentData.current.humidity}%</span></div>
            <div className="comp-row"><span className="comp-label">Wind</span><span>{fmtWind(currentData.current.wind_kph, currentData.current.wind_mph)}</span></div>
            <div className="comp-row"><span className="comp-label">Condition</span><span>{currentData.current.condition.text}</span></div>
          </div>
          <div className="comparison-card">
            <h3>{date}</h3>
            <div className="comp-row"><span className="comp-label">Avg Temp</span><span>{fmt(history.avgtemp_c, history.avgtemp_f)}</span></div>
            <div className="comp-row"><span className="comp-label">High / Low</span><span>{fmt(history.maxtemp_c, history.maxtemp_f)} / {fmt(history.mintemp_c, history.mintemp_f)}</span></div>
            <div className="comp-row"><span className="comp-label">Humidity</span><span>{history.avghumidity}%</span></div>
            <div className="comp-row"><span className="comp-label">Wind</span><span>{fmtWind(history.maxwind_kph, history.maxwind_mph)}</span></div>
            <div className="comp-row"><span className="comp-label">Condition</span><span>{history.condition.text}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
