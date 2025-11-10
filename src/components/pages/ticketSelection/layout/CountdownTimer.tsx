/**
 * Countdown Timer (Production-Ready)
 * Reliable timer using Page Visibility API + requestAnimationFrame
 * @description Solves background tab throttling issues
 */

"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cancelReservationThunk } from '@/store/features/ticket/ticketSlice';

interface CountdownTimerProps {
  startTime: number;
  duration: number;
  onTimeExpired?: () => void;
}

export default function CountdownTimer({
  startTime,
  duration,
  onTimeExpired
}: CountdownTimerProps) {
  const dispatch = useAppDispatch();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpiring, setIsExpiring] = useState(false);

  // Refs for stable references
  const isExpiringRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  // Redux'tan rezervasyon ID'sini al
  const reservationId = useAppSelector(
    (state) => state.ticket.reservation.reservationId
  );

  // ============================================
  // CALCULATE TIME LEFT (Pure function)
  // ============================================

  const calculateTimeLeft = useCallback(() => {
    const endTime = startTime + duration * 60 * 1000;
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    return remaining;
  }, [startTime, duration]);

  // ============================================
  // HANDLE EXPIRATION (Stable reference)
  // ============================================

  const handleExpiration = useCallback(async () => {
    // Guard: Zaten expire işlemi başladıysa tekrar çağırma
    if (isExpiringRef.current) return;

    isExpiringRef.current = true;
    setIsExpiring(true);

    // Backend'e iptal request
    if (reservationId) {
      try {
        await dispatch(cancelReservationThunk(reservationId));
      } catch (error) {
        console.error('❌ Error cancelling reservation:', error);
      }
    }

    // Callback çağır (modal göstermek için)
    onTimeExpired?.();

    setIsExpiring(false);
  }, [reservationId, dispatch, onTimeExpired]);

  // ============================================
  // REQUESTANIMATIONFRAME LOOP
  // ============================================

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = calculateTimeLeft();

      // Update her saniye (throttle)
      if (now - lastUpdateRef.current >= 1000 || remaining === 0) {
        setTimeLeft(remaining);
        lastUpdateRef.current = now;

        // Süre doldu mu?
        if (remaining === 0 && !isExpiringRef.current) {
          handleExpiration();
          return; // Loop'u durdur
        }
      }

      // Devam et
      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    // İlk update
    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    // Eğer zaten expired ise direkt handle et
    if (initial === 0 && !isExpiringRef.current) {
      handleExpiration();
    } else {
      // Loop'u başlat
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calculateTimeLeft, handleExpiration]);

  // ============================================
  // PAGE VISIBILITY API (Background tab kontrolü)
  // ============================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {

        // Tab aktif olduğunda immediate check
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);

        // Süre dolmuşsa hemen handle et
        if (remaining === 0 && !isExpiringRef.current) {
          handleExpiration();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [calculateTimeLeft, handleExpiration]);

  // ============================================
  // FORMAT & STYLING
  // ============================================

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

  // SVG dimensions
  const width = 80;
  const height = 32;
  const radius = height / 2;
  const strokeWidth = 3;

  // Pill shape path
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

  // Path length calculation
  const straightLength = width - radius * 2;
  const arcLength = Math.PI * (radius - strokeWidth);
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
          <span className="text-md font-bold tabular-nums" style={{ color }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}