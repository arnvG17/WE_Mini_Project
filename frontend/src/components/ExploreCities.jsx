import React from 'react';

const MAJOR_CITIES = [
  { name: 'London', country: 'UK', code: 'London', type: 'rainy' },
  { name: 'New York', country: 'USA', code: 'New York', type: 'sunny' },
  { name: 'Tokyo', country: 'Japan', code: 'Tokyo', type: 'clouds' },
  { name: 'Paris', country: 'France', code: 'Paris', type: 'sunny' },
  { name: 'Dubai', country: 'UAE', code: 'Dubai', type: 'sunny' },
  { name: 'Singapore', country: 'Singapore', code: 'Singapore', type: 'rainy' },
  { name: 'Mumbai', country: 'India', code: 'Mumbai', type: 'sunny' },
  { name: 'Sydney', country: 'Australia', code: 'Sydney', type: 'sunny' },
  { name: 'Berlin', country: 'Germany', code: 'Berlin', type: 'clouds' },
  { name: 'Toronto', country: 'Canada', code: 'Toronto', type: 'snowy' },
  { name: 'Reykjavik', country: 'Iceland', code: 'Reykjavik', type: 'snowy' },
  { name: 'Cairo', country: 'Egypt', code: 'Cairo', type: 'dust' },
  { name: 'Delhi', country: 'India', code: 'Delhi', type: 'heatwave' },
  { name: 'San Francisco', country: 'USA', code: 'San Francisco', type: 'mist' },
  { name: 'Cape Town', country: 'South Africa', code: 'Cape Town', type: 'sunny' },
];

function WeatherIcon({ type }) {
  if (type === 'sunny') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
  if (type === 'rainy') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 13a4 4 0 0 0-8 0"/><path d="M8 13v1a4 4 0 0 0 8 0v-1"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><path d="M8 19v2M12 19v2M16 19v2"/></svg>;
  if (type === 'snowy') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="M8 16h.01M12 16h.01M16 16h.01M10 20h.01M14 20h.01"/></svg>;
  if (type === 'heatwave') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925 4.128"/><path d="M13 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M18 22c.6 0 1-.4 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1c0 .6.4 1 1 1h1Z"/></svg>;
  if (type === 'mist') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10a4 4 0 0 1 4 4"/><path d="M12 21A9 9 0 0 0 3 12"/><path d="M7 22a5 5 0 0 1-5-5"/><path d="M17 10a4 4 0 0 0-4 4"/><path d="M21 12a9 9 0 0 1-9 9"/><path d="M22 17a5 5 0 0 0-5-5"/></svg>;
  if (type === 'dust') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h20"/><path d="M4 17h16"/><path d="M6 21h12"/><path d="M2 9h20"/><path d="M4 5h16"/></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-4-4.5h-1.2c-.4-2.5-2.6-4.5-5.3-4.5-3 0-5.5 2.5-5.5 5.5 0 .2 0 .4.1.6C3.9 12.1 2 13.8 2 16c0 2.2 1.8 4 4 4h11.5"/></svg>;
}

/**
 * ExploreCities — A page listing major world cities for quick access.
 */
export default function ExploreCities({ onCitySelect }) {
  return (
    <div className="explore-cities animate-slide-up">
      <h2 className="explore-title">City Explorer</h2>
      <div className="cities-grid">
        {MAJOR_CITIES.map((city) => (
          <div 
            key={city.code} 
            className={`city-card mini-dashboard ${city.type}`}
            onClick={() => onCitySelect(city.code)}
          >
            <div className="mini-content">
              <div className="city-info">
                <span className="city-name">{city.name}</span>
                <span className="city-country">{city.country}</span>
              </div>
              <div className="mini-weather">
                <WeatherIcon type={city.type} />
              </div>
            </div>
            <div className="mini-glow" />
          </div>
        ))}
      </div>
    </div>
  );
}
