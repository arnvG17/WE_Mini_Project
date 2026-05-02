import React from 'react';

/** Shows recent search chips from localStorage. Clicking a chip re-searches that city. */
export default function RecentSearches({ searches, onSelect }) {
  if (!searches || searches.length === 0) return null;
  return (
    <div className="recent-searches">
      {searches.map((city, i) => (
        <button key={i} className="recent-chip" onClick={() => onSelect(city)}>
          {city}
        </button>
      ))}
    </div>
  );
}
