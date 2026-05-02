import React from 'react';

/**
 * Forecast — Horizontal scroll row of 5-day forecast cards.
 * Each card shows day name, icon, high/low temps, condition, and rain chance.
 */
export default function Forecast({ data, unit }) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="forecast-section">
      <h2>5-Day Forecast</h2>
      <div className="forecast-row">
        {data.map((day, i) => {
          const date = new Date(day.date + 'T00:00:00');
          const dayName = i === 0 ? 'Today' : dayNames[date.getDay()];
          const high = unit === 'C' ? `${Math.round(day.maxtemp_c)}°` : `${Math.round(day.maxtemp_f)}°`;
          const low = unit === 'C' ? `${Math.round(day.mintemp_c)}°` : `${Math.round(day.mintemp_f)}°`;

          return (
            <div key={day.date} className="forecast-card">
              <p className="day">{dayName}</p>
              <img className="weather-icon" src={`https:${day.condition.icon}`} alt={day.condition.text} />
              <p className="temp-range">{high} / <span>{low}</span></p>
              <p className="cond">{day.condition.text}</p>
              {day.daily_chance_of_rain > 0 && (
                <p className="rain">💧 {day.daily_chance_of_rain}%</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
