import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import './AQILeaderboard.css';

// 1. GET A TOKEN AT: https://aqicn.org/data-platform/token/
// 2. PASTE IT HERE:
const AQI_TOKEN = 'b2be81867647504055330f6a8abaa42df542cb3b'; 

const CACHE_KEY = 'weathervue_aqi_cache_waqi';
const CITIES_KEY = 'weathervue_aqi_cities_waqi';
const REFRESH_INTERVAL = 60 * 60 * 1000;
const CACHE_EXPIRY = 10 * 60 * 1000;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_CITIES = [
  'Delhi', 'Mumbai', 'Beijing', 'Shanghai', 'Lahore', 'Dhaka',
  'London', 'Paris', 'New York', 'Tokyo', 'Sydney', 'Singapore'
];

const CATEGORIES = [
  { min: 0, max: 50, label: 'Good', color: '#4ade80', recommendation: 'Air quality is good. No precautions needed.' },
  { min: 51, max: 100, label: 'Moderate', color: '#facc15', recommendation: 'Sensitive groups should reduce outdoor activity.' },
  { min: 101, max: 150, label: 'Unhealthy (SG)', color: '#fb923c', recommendation: 'Sensitive groups should avoid outdoor activity.' },
  { min: 151, max: 200, label: 'Unhealthy', color: '#f87171', recommendation: 'Everyone should limit outdoor activity.' },
  { min: 201, max: 300, label: 'Very Unhealthy', color: '#c084fc', recommendation: 'Everyone should avoid outdoor activity.' },
  { min: 301, max: 1000, label: 'Hazardous', color: '#fda4af', recommendation: 'Health emergency. Stay indoors.' }
];

const getCategory = (aqi) => {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return null;
  return CATEGORIES.find(c => aqi <= c.max) || CATEGORIES[CATEGORIES.length - 1];
};

const AQILeaderboard = ({ onSetMainCity, onViewOnMap }) => {
  const [cities, setCities] = useState(() => {
    const saved = localStorage.getItem(CITIES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });
  const [aqiData, setAqiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);
  const [newCity, setNewCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addError, setAddError] = useState('');
  const dropdownRef = useRef(null);

  // Fetch suggestions for the 'Add City' input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (newCity.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`${API_BASE}/search/${encodeURIComponent(newCity)}`);
        setSuggestions(data);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [newCity]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllAQI = useCallback(async (force = false) => {
    // ... (rest of fetchAllAQI)
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setAqiData(data);
          setLastUpdated(timestamp);
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Fetch from waqi.info directly as requested
      const promises = cities.map(city => 
        axios.get(`https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${AQI_TOKEN}`)
          .then(res => ({ searchName: city, ...res.data }))
          .catch(() => ({ searchName: city, status: 'error' }))
      );

      const results = await Promise.all(promises);
      
      const processed = results.map(res => {
        if (res.status !== 'ok' || !res.data) {
          return { searchName: res.searchName, name: res.searchName, aqi: null, status: 'error' };
        }
        
        const d = res.data;
        return {
          searchName: res.searchName,
          name: d.city.name,
          aqi: parseInt(d.aqi),
          dominantPollutant: d.dominentpol,
          pollutants: {
            pm25: d.iaqi?.pm25?.v,
            pm10: d.iaqi?.pm10?.v,
            no2: d.iaqi?.no2?.v,
            o3: d.iaqi?.o3?.v,
            co: d.iaqi?.co?.v,
            so2: d.iaqi?.so2?.v
          },
          geo: d.city.geo,
          lastUpdate: d.time.s,
          status: 'ok'
        };
      });

      const sorted = [...processed].sort((a, b) => {
        if (a.aqi === null || isNaN(a.aqi)) return 1;
        if (b.aqi === null || isNaN(b.aqi)) return -1;
        return b.aqi - a.aqi;
      });

      setAqiData(sorted);
      setLastUpdated(Date.now());
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() }));
    } catch (err) {
      console.error('AQI Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [cities]);

  useEffect(() => {
    fetchAllAQI();
    const interval = setInterval(fetchAllAQI, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAllAQI]);

  useEffect(() => {
    localStorage.setItem(CITIES_KEY, JSON.stringify(cities));
  }, [cities]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    
    setLoading(true);
    setAddError('');
    try {
      const res = await axios.get(`https://api.waqi.info/feed/${encodeURIComponent(newCity)}/?token=${AQI_TOKEN}`);
      if (res.data.status === 'ok') {
        if (!cities.includes(newCity)) {
          setCities(prev => [...prev, newCity]);
          setNewCity('');
          fetchAllAQI(true);
        } else {
          setAddError('City already in list');
        }
      } else {
        setAddError('Station not found');
      }
    } catch (err) {
      setAddError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const removeCity = (searchName) => {
    setCities(prev => prev.filter(c => c !== searchName));
    setAqiData(prev => prev.filter(d => d.searchName !== searchName));
  };

  const summary = useMemo(() => {
    const validData = aqiData.filter(d => d.status === 'ok' && !isNaN(d.aqi));
    if (validData.length === 0) return null;

    const sorted = [...validData].sort((a, b) => a.aqi - b.aqi);
    const avg = Math.round(validData.reduce((acc, curr) => acc + curr.aqi, 0) / validData.length);
    const unhealthyCount = validData.filter(d => d.aqi > 100).length;

    return {
      cleanest: sorted[0],
      mostPolluted: sorted[sorted.length - 1],
      average: avg,
      unhealthyCount
    };
  }, [aqiData]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    // WAQI time is often a string like "2024-05-02 17:00:00"
    return 'Real-time';
  };

  return (
    <div className="aqi-leaderboard animate-fade-in">
      <div className="aqi-summary-bar">
        {summary && (
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Cleanest</span>
              <span className="value success">{summary.cleanest.name.split(',')[0]}</span>
            </div>
            <div className="summary-item">
              <span className="label">Most Polluted</span>
              <span className="value danger">{summary.mostPolluted.name.split(',')[0]}</span>
            </div>
            <div className="summary-item">
              <span className="label">Avg AQI</span>
              <span className="value">{summary.average}</span>
            </div>
            <div className="summary-item">
              <span className="label">Unhealthy</span>
              <span className="value warning">{summary.unhealthyCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="aqi-table-container">
        <table className="aqi-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>City</th>
              <th>AQI (US-EPA)</th>
              <th>Category</th>
              <th>Dominant</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {loading && aqiData.length === 0 ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan="6"><div className="skeleton-line"></div></td>
                </tr>
              ))
            ) : (
              aqiData.map((data, index) => {
                const cat = getCategory(data.aqi);
                const isExpanded = expandedCity === data.searchName;

                return (
                  <React.Fragment key={data.searchName}>
                    <tr 
                      className={`city-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedCity(isExpanded ? null : data.searchName)}
                      style={{ borderLeft: `2px solid ${cat?.color || 'transparent'}` }}
                    >
                      <td className="rank-cell">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="city-cell">
                        <span className="city-name-aqi">
                          {data.name.split(',')[0]}
                        </span>
                        <span className="update-time">{data.status === 'ok' ? 'Station Data' : 'Offline'}</span>
                      </td>
                      <td className="aqi-cell">
                        <div className="aqi-score-box">
                          <span className="aqi-val" style={{ color: cat?.color }}>{data.aqi || '--'}</span>
                          <div className="aqi-mini-bar">
                            <div className="aqi-bar-fill" style={{ width: `${Math.min(100, (data.aqi / 300) * 100)}%`, backgroundColor: cat?.color }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="cat-cell">
                        <div className="cat-badge" style={{ color: cat?.color }}>
                          <span className="cat-dot" style={{ backgroundColor: cat?.color }}></span>
                          <span className="cat-label-text">{cat?.label || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="pollutant-cell">
                        <span className="pollutant-badge">{data.dominantPollutant?.toUpperCase() || '--'}</span>
                      </td>
                      <td className="trend-cell">→</td>
                    </tr>
                    {isExpanded && data.status === 'ok' && (
                      <tr className="expansion-row">
                        <td colSpan="6">
                          <div className="expanded-content animate-fade-in">
                            <div className="pollutant-grid">
                              {Object.entries(data.pollutants).map(([key, val]) => (
                                <div key={key} className="pollutant-item">
                                  <span className="p-label">{key.toUpperCase()}</span>
                                  <span className="p-value">{val || '--'} <span className="unit">µg/m³</span></span>
                                </div>
                              ))}
                            </div>
                            <div className="health-rec">
                              <h4>Health Recommendation</h4>
                              <p>{cat?.recommendation}</p>
                            </div>
                            <div className="action-row">
                              <button className="action-btn map-btn" onClick={(e) => { e.stopPropagation(); onViewOnMap({ geo: data.geo, searchName: data.searchName }); }}>
                                📍 View on Map
                              </button>
                              <button className="action-btn main-btn" onClick={(e) => { e.stopPropagation(); onSetMainCity(data.searchName); }}>
                                🏠 Set as Main
                              </button>
                              <button className="action-btn remove-btn" onClick={(e) => { e.stopPropagation(); removeCity(data.searchName); }}>
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="add-city-section" ref={dropdownRef}>
        <form onSubmit={handleAddCity} className="add-city-form">
          <div className="input-wrapper-aqi">
            <input 
              type="text" 
              placeholder="Search city to add..." 
              value={newCity}
              onChange={(e) => {
                setNewCity(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="search-dropdown aqi-dropdown glass-card">
                {suggestions.map((item) => (
                  <div 
                    key={item.id} 
                    className="suggestion-item" 
                    onClick={() => {
                      const cityName = `${item.name}, ${item.country}`;
                      setNewCity(cityName);
                      setShowDropdown(false);
                      // Trigger add automatically
                      if (!cities.includes(cityName)) {
                        setCities(prev => [...prev, cityName]);
                        setNewCity('');
                        fetchAllAQI(true);
                      }
                    }}
                  >
                    <span className="suggestion-name">{item.name}</span>
                    <span className="suggestion-region">{item.region}, {item.country}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}>Add City</button>
        </form>
        {addError && <p className="add-error">{addError}</p>}
      </div>
    </div>
  );
};

export default AQILeaderboard;
