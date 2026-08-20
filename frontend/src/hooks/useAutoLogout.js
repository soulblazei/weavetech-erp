import { useEffect, useRef, useCallback } from 'react';

const TRACKED_EVENTS = [
  'touchstart', 'touchmove', 'mousedown', 
  'mousemove', 'keydown', 'scroll', 'visibilitychange'
];

export function useAutoLogout({ onLogout, timeoutMinutes = 15, warningMinutes = 1, onWarning }) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActiveTimestamp = useRef(Date.now());

  const executeLogout = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    localStorage.removeItem('weaving_auth_token');
    localStorage.removeItem('weaving_user_profile');
    if (onLogout) onLogout();
  }, [onLogout]);

  const resetTimer = useCallback(() => {
    lastActiveTimestamp.current = Date.now();
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    if (onWarning && warningMinutes > 0) {
      warningTimerRef.current = setTimeout(() => onWarning(), warningMs);
    }
    logoutTimerRef.current = setTimeout(() => executeLogout(), timeoutMs);
  }, [executeLogout, onWarning, timeoutMs, warningMs, warningMinutes]);

  useEffect(() => {
    const handleActivity = (e) => {
      if (e.type === 'visibilitychange' && document.hidden) return;
      const elapsed = Date.now() - lastActiveTimestamp.current;
      if (elapsed >= timeoutMs) {
        executeLogout();
        return;
      }
      resetTimer();
    };

    TRACKED_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      TRACKED_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [resetTimer, executeLogout, timeoutMs]);

  return { resetTimer };
}