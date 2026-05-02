import React from 'react';

/**
 * WeatherDashboard — A comprehensive, data-rich weather dashboard layout
 * inspired by modern minimalist weather apps.
 */
export default function WeatherDashboard({ data, unit }) {
  const { current, location, astronomy, today_summary, hourly, forecast } = data;
  const todayForecast = forecast[0];
  
  const fmt = (c, f) => unit === 'C' ? `${Math.round(c)}°` : `${Math.round(f)}°`;
  const speed = (k, m) => unit === 'C' ? `${k} km/h` : `${m} mph`;
  const dist = (k, m) => unit === 'C' ? `${k} km` : `${m} mi`;
  const precip = (m, i) => unit === 'C' ? `${m} mm` : `${i} in`;
  
  // Prepare segments from today_summary
  const segments = [
    { name: 'Morning', ...today_summary.morning },
    { name: 'Afternoon', ...today_summary.afternoon },
    { name: 'Evening', ...today_summary.evening },
    { name: 'Overnight', ...today_summary.overnight }
  ];

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* --- Main Content --- */}
      <div className="dashboard-main">
        
        {/* 1. Hero Card */}
        <div className="hero-card glass-card">
          <div className="hero-header">
            <span className="location-tag">{location.name}, {location.country}</span>
          </div>
          <div className="hero-body">
            <div className="hero-main-row">
              <div className="hero-temp-group">
                <span className="hero-temp">{fmt(current.temp_c, current.temp_f)}</span>
                <div className="hero-condition-group">
                  <img src={`https:${current.condition.icon}`} alt={current.condition.text} className="hero-icon" />
                  <span className="hero-condition">{current.condition.text}</span>
                </div>
              </div>
              <div className="hero-time-group">
                <span className="hero-time">{location.localtime.split(' ')[1]}</span>
                <span className="hero-time-label">Local Time</span>
              </div>
            </div>
            <div className="hero-summary">
              <span>H: {fmt(todayForecast.maxtemp_c, todayForecast.maxtemp_f)}</span>
              <span className="dot">·</span>
              <span>L: {fmt(todayForecast.mintemp_c, todayForecast.mintemp_f)}</span>
            </div>
          </div>
        </div>

        {/* 2. Weather Today Grid */}
        <div className="section-card glass-card">
          <h3 className="section-title">Atmospheric Conditions</h3>
          <div className="weather-today-header">
            <div className="feels-like-big">
              <span className="label">Feels Like</span>
              <span className="value">{fmt(current.feelslike_c, current.feelslike_f)}</span>
            </div>
            <div className="sun-astro">
              <div className="astro-times">
                <div className="astro-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7.5M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1"/></svg>
                  <span>{astronomy.sunrise}</span>
                </div>
                <div className="astro-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 9v7.5M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1"/></svg>
                  <span>{astronomy.sunset}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="details-grid-8">
            <div className="detail-row"><span className="label">Humidity</span><span className="value">{current.humidity}%</span></div>
            <div className="detail-row"><span className="label">Wind</span><span className="value">{speed(current.wind.kph, current.wind.mph)}</span></div>
            <div className="detail-row"><span className="label">Beaufort</span><span className="value" style={{fontSize: '0.85rem'}}>{current.wind.beaufort}</span></div>
            <div className="detail-row"><span className="label">UV Index</span><span className="value">{current.uv.display} • {current.uv.label}</span></div>
            <div className="detail-row"><span className="label">Pressure</span><span className="value">{current.pressure_mb} mb ({current.pressure_trend})</span></div>
            <div className="detail-row"><span className="label">Visibility</span><span className="value">{dist(current.vis_km, current.vis_miles)}</span></div>
            <div className="detail-row"><span className="label">Dew Point</span><span className="value">{fmt(current.dewpoint_c, current.dewpoint_f)}</span></div>
            <div className="detail-row"><span className="label">Moon</span><span className="value" style={{fontSize: '0.9rem'}}>{astronomy.moon_phase}</span></div>
          </div>
        </div>

        {/* 3. Day Segments */}
        <div className="section-card glass-card">
          <h3 className="section-title">Period Summary</h3>
          <div className="segments-list">
            {segments.map(s => (
              <div key={s.name} className="segment-row">
                <span className="segment-name">{s.name}</span>
                <span className="segment-temp">{fmt(s.avg_temp_c, s.avg_temp_f)}</span>
                <div className="segment-cond">
                  <img src={`https:${s.dominant_icon}`} alt={s.dominant_condition} />
                  <span>{s.dominant_condition}</span>
                </div>
                <span className="segment-rain">{s.max_chance_of_rain > 0 ? `💧 ${s.max_chance_of_rain}%` : '--'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Hourly Forecast */}
        <div className="section-card glass-card">
          <h3 className="section-title">Next 12 Hours</h3>
          <div className="hourly-list">
            {hourly.slice(0, 12).map(h => (
              <div key={h.time} className="hour-row">
                <span className="hour-time">{h.time}</span>
                <span className="hour-temp">{fmt(h.temp_c, h.temp_f)}</span>
                <div className="hour-cond">
                  <img src={`https:${h.condition.icon}`} alt={h.condition.text} />
                  <span>{h.condition.text}</span>
                </div>
                <span className="hour-rain">{h.chance_of_rain > 0 ? `💧 ${h.chance_of_rain}%` : '--'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Sidebar --- */}
      <div className="dashboard-sidebar">
        
        {/* AQI Card */}
        {current.air_quality && (
          <div className="side-card glass-card">
            <h3 className="side-title">Air Quality Index</h3>
            <div className="aqi-score-container">
              <div className="aqi-circle" style={{ '--percent': `${Math.min((current.air_quality.score / 500) * 100, 100)}%` }}>
                <span className="aqi-value">{current.air_quality.score}</span>
              </div>
              <div className="aqi-text">
                <span className="aqi-status">{current.air_quality.label}</span>
                <span className="aqi-desc">PM2.5: {current.air_quality.pm2_5.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="pollutants-list">
              <div className="pollutant-item">
                <span className="p-label">PM10</span>
                <span className="p-value">{current.air_quality.pm10.toFixed(1)}</span>
              </div>
              <div className="pollutant-item">
                <span className="p-label">O3 (Ozone)</span>
                <span className="p-value">{current.air_quality.o3.toFixed(1)}</span>
              </div>
              <div className="pollutant-item">
                <span className="p-label">NO2</span>
                <span className="p-value">{current.air_quality.no2.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        <div className="side-card glass-card">
          <h3 className="side-title">7-Day Forecast</h3>
          <div className="forecast-mini-list">
            {forecast.map(day => (
              <div key={day.date} className="forecast-mini-item">
                <span className="f-day">{day.day_of_week.substring(0, 3)}</span>
                <img src={`https:${day.condition.icon}`} alt={day.condition.text} />
                <div className="f-temps">
                  <span className="f-max">{fmt(day.maxtemp_c, day.maxtemp_f)}</span>
                  <span className="f-min">{fmt(day.mintemp_c, day.mintemp_f)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
