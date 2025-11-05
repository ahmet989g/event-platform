"use client";

/**
 * Countdown Timer
 * Pill shape border progress (template based)
 */

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  startTime: number;
  duration: number;
  onTimeExpired?: () => void;
}

export default function CountdownTimer({ startTime, duration, onTimeExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = startTime + duration * 60 * 1000;
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        if (onTimeExpired) {
          onTimeExpired();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeExpired]);

  // Dakika ve saniye
  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Progress (0-100)
  const totalDuration = duration * 60;
  const progress = (totalSeconds / totalDuration) * 100;

  // Renk
  const getColor = () => {
    if (minutes < 2) return '#ef4444'; // red
    if (minutes < 5) return '#f97316'; // orange
    return '#00ADB5'; // primary
  };

  const color = getColor();

  // SVG dimensions (template'e göre scaled)
  const width = 80;
  const height = 32;
  const radius = height / 2; // 28 (pill shape için yarım yükseklik)
  const strokeWidth = 3;

  // Template'deki gibi path (pill shape)
  // M start A top-left L top-line A top-right L right-line A bottom-right L bottom-line A bottom-left Z
  const pathD = `
    M ${strokeWidth} ${radius}
    A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${radius} ${strokeWidth}
    L ${width - radius} ${strokeWidth}
    A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${width - strokeWidth} ${radius}
    L ${width - strokeWidth} ${radius}
    A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${width - radius} ${height - strokeWidth}
    L ${radius} ${height - strokeWidth}
    A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${strokeWidth} ${radius}
    Z
  `;

  // Path length calculation (perimeter)
  const straightLength = width - radius * 2; // Top + bottom
  const arcLength = Math.PI * (radius - strokeWidth); // Half circle × 2
  const pathLength = straightLength * 2 + arcLength * 2;

  const strokeDashoffset = pathLength - (progress / 100) * pathLength;

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        {/* SVG */}
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background path */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="dark:stroke-gray-700"
          />

          {/* Progress path */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={pathLength}
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-md font-bold tabular-nums"
            style={{ color }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}