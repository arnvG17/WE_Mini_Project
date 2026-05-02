import React, { useMemo } from 'react';

/**
 * WeatherParticles — Renders CSS-animated weather effects based on the active theme.
 * - Clear: pulsing sun glow
 * - Rain: falling rain drops (randomized positions/speeds)
 * - Snow: drifting snowflakes
 * - Storm: handled by CSS ::after lightning flash
 * - Clouds: no particles (just the muted theme)
 * 
 * Uses useMemo so particles aren't regenerated on every render.
 */
export default function WeatherParticles({ theme }) {
  // Generate rain drops with randomized positions and animation durations
  const rainDrops = useMemo(() => {
    if (theme !== 'rain' && theme !== 'storm') return null;
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${15 + Math.random() * 25}px`,
      duration: `${0.6 + Math.random() * 0.8}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [theme]);

  // Generate snowflakes with randomized positions, sizes, and drift speeds
  const snowflakes = useMemo(() => {
    if (theme !== 'snow') return null;
    const flakes = ['*', '+', '·', '•', '×'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      char: flakes[Math.floor(Math.random() * flakes.length)],
      size: `${0.6 + Math.random() * 1}rem`,
      duration: `${4 + Math.random() * 6}s`,
      delay: `${Math.random() * 5}s`,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, [theme]);

  return (
    <div className="weather-particles">
      {/* Sun glow for clear theme — positioned via CSS */}
      {theme === 'clear' && <div className="sun-glow" />}

      {/* Rain drops */}
      {rainDrops && rainDrops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            height: drop.height,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
            opacity: drop.opacity,
          }}
        />
      ))}

      {/* Snowflakes */}
      {snowflakes && snowflakes.map(flake => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            fontSize: flake.size,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            opacity: flake.opacity,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
