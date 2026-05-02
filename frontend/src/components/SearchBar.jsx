import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * SearchBar — City search input with glassmorphic dropdown for autocomplete suggestions.
 */
export default function SearchBar({ onSearch, onGeolocate, loading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`${API_BASE}/search/${encodeURIComponent(query)}`);
        setSuggestions(data);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (cityName) => {
    setQuery(cityName);
    onSearch(cityName);
    setShowDropdown(false);
  };

  return (
    <div className="search-wrapper" ref={dropdownRef}>
      <form className="search-container" onSubmit={handleSubmit}>
        <input
          id="city-search"
          className="search-input"
          type="text"
          placeholder="Search any city..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={loading}
          autoComplete="off"
        />
        <button id="search-btn" className="search-btn" type="submit" disabled={loading || !query.trim()}>
          {loading ? '...' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search
            </>
          )}
        </button>
        <button id="geo-btn" className="geo-btn" type="button" onClick={onGeolocate} disabled={loading} title="Use my location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="search-dropdown glass-card">
          {suggestions.map((item) => (
            <div 
              key={item.id} 
              className="suggestion-item" 
              onClick={() => handleSuggestionClick(`${item.name}, ${item.country}`)}
            >
              <span className="suggestion-name">{item.name}</span>
              <span className="suggestion-region">{item.region}, {item.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
