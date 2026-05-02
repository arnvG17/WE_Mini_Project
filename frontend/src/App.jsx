import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import RecentSearches from './components/RecentSearches';
import WeatherDashboard from './components/WeatherDashboard';
import WeatherParticles from './components/WeatherParticles';
import ExploreCities from './components/ExploreCities';
import VisualizeTab from './components/VisualizeTab';
import AQILeaderboard from './components/AQILeaderboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RECENT_KEY = 'weathervue_recent';
const MAX_RECENT = 8;

/**
 * App — Root component.
 * Reorganized for a high-information, minimalist dashboard.
 */
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [theme, setTheme] = useState(''); 
  const [unit, setUnit] = useState('C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [view, setView] = useState('dashboard');
  const [hasOpenedVisualize, setHasOpenedVisualize] = useState(false);

  useEffect(() => {
    if (view === 'visualize') setHasOpenedVisualize(true);
  }, [view]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
      setRecentSearches(saved);
    } catch { setRecentSearches([]); }
  }, []);

  const saveRecent = useCallback((cityName) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      const updated = [cityName, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchWeather = useCallback(async (cityName) => {
    setLoading(true);
    setError('');
    setCity(cityName);
    // If we are in visualize view, don't switch back to dashboard automatically
    // but the user might want to see the update in the current view.
    // However, the original code had setView('dashboard').
    // I'll keep it as dashboard unless the user is already on visualize.
    if (view !== 'visualize') {
      setView('dashboard');
    }

    try {
      const res = await axios.get(`${API_BASE}/dashboard/${encodeURIComponent(cityName)}`);
      const data = res.data;

      setWeatherData(data);
      setTheme(data.theme);
      saveRecent(data.location.name);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch weather data.';
      setError(msg);
      setWeatherData(null);
      setTheme('');
    }
    setLoading(false);
  }, [saveRecent, view]);

  // Force theme on body for bulletproof backgrounds
  useEffect(() => {
    // Remove old theme classes
    const body = document.body;
    body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
    if (theme) body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    if (navigator.geolocation && !city) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => {}
      );
    }
  }, [fetchWeather, city]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => setError('Location access denied.')
    );
  };

  const handleSetMainCity = (cityName) => {
    fetchWeather(cityName);
    setView('dashboard');
  };

  const handleViewOnMap = async (aqiCityData) => {
    // First fetch weather to populate weatherData which Cesium uses
    await fetchWeather(aqiCityData.searchName);
    setView('visualize');
  };

  return (
    <div className={`app ${theme ? `theme-${theme}` : ''}`}>
      <WeatherParticles theme={theme} />

      <div className="app-inner">
        <header className="app-header">
          <div className="view-toggle">
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
            <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}>Explore</button>
            <button className={view === 'leaderboard' ? 'active' : ''} onClick={() => setView('leaderboard')}>
              Leaderboard
            </button>
            <button className={view === 'visualize' ? 'active' : ''} onClick={() => setView('visualize')}>Visualize</button>
          </div>
          <h1>{view === 'dashboard' && weatherData ? weatherData.location.name : 'WeatherVue'}</h1>
        </header>

        <SearchBar onSearch={fetchWeather} onGeolocate={handleGeolocate} loading={loading} />

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <>
            <div className="toggle-row">
              <UnitToggle unit={unit} onToggle={setUnit} />
              <RecentSearches searches={recentSearches} onSelect={fetchWeather} />
            </div>

            {error && <div className="error-banner" role="alert">{error}</div>}

            {loading && (
              <div className="spinner-overlay">
                <div className="spinner" />
                <p>Analyzing atmospheric patterns...</p>
              </div>
            )}

            {!loading && weatherData && (
              <WeatherDashboard 
                data={weatherData} 
                unit={unit} 
              />
            )}

            {!loading && !weatherData && !error && (
              <div className="empty-state">
                 <svg style={{ opacity: 0.15 }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <p>Search a city to begin your journey</p>
              </div>
            )}
          </>
        )}

        {/* Visualize View — Persistently mounted after first use to avoid Cesium re-init */}
        <div style={{ display: view === 'visualize' ? 'block' : 'none' }}>
          {hasOpenedVisualize && (
            <VisualizeTab 
              data={weatherData} 
              unit={unit} 
              active={view === 'visualize'}
              onBack={() => setView('dashboard')} 
              onSearch={fetchWeather}
            />
          )}
        </div>

        {/* Explore View */}
        {view === 'explore' && <ExploreCities onCitySelect={fetchWeather} />}

        {/* AQI Leaderboard View */}
        {view === 'leaderboard' && (
          <AQILeaderboard 
            onSetMainCity={handleSetMainCity}
            onViewOnMap={handleViewOnMap}
          />
        )}
      </div>
    </div>
  );
}

export default App;
