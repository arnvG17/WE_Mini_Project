import React from 'react';

/**
 * CurrentWeather — Displays current conditions in a glass card.
 * Shows temp, feels-like, humidity, wind, pressure, UV, sunrise/sunset.
 */
export default function CurrentWeather({ data, astronomy, unit }) {
  const { current, location } = data;
  const temp = unit === 'C' ? `${Math.round(current.temp_c)}°C` : `${Math.round(current.temp_f)}°F`;
  const feels = unit === 'C' ? `${Math.round(current.feelslike_c)}°C` : `${Math.round(current.feelslike_f)}°F`;
  const wind = unit === 'C' ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;

  return (
    <div className="current-weather glass-card">
      <div className="current-main">
        <p className="location-name">{location.name}, {location.country}</p>
        <img className="weather-icon" src={`https:${current.condition.icon}`} alt={current.condition.text} />
        <p className="temp">{temp}</p>
        <p className="condition">{current.condition.text}</p>
      </div>
      <div className="current-details">
        <div className="detail-item">
          <span className="label">Feels Like</span>
          <span className="value">{feels}</span>
        </div>
        <div className="detail-item">
          <span className="label">Humidity</span>
          <span className="value">{current.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="label">Wind</span>
          <span className="value">{wind} {current.wind_dir}</span>
        </div>
        <div className="detail-item">
          <span className="label">Pressure</span>
          <span className="value">{current.pressure_mb} mb</span>
        </div>
        <div className="detail-item">
          <span className="label">UV Index</span>
          <span className="value">{current.uv}</span>
        </div>
        <div className="detail-item">
          <span className="label">Visibility</span>
          <span className="value">{current.vis_km} km</span>
        </div>
        {astronomy && (
          <>
            <div className="detail-item">
              <span className="label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:'4px'}}><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7.5M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4"/></svg> Sunrise</span>
              <span className="value">{astronomy.sunrise}</span>
            </div>
            <div className="detail-item">
              <span className="label"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:'4px'}}><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 9v7.5M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M16 5l-4 4-4-4"/></svg> Sunset</span>
              <span className="value">{astronomy.sunset}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
