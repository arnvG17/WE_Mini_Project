import React from 'react';

/** Celsius / Fahrenheit toggle — no re-fetch needed, just switches display unit. */
export default function UnitToggle({ unit, onToggle }) {
  return (
    <div className="unit-toggle">
      <button className={unit === 'C' ? 'active' : ''} onClick={() => onToggle('C')}>°C</button>
      <button className={unit === 'F' ? 'active' : ''} onClick={() => onToggle('F')}>°F</button>
    </div>
  );
}
