import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useRealtimeSync Hook
 * Lightweight Real-Time subscription manager over Factory LAN.
 * Uses SSE / WebSocket to receive delta broadcasts (e.g. 'HANDOVER_COMPLETED', 'BATCH_UPDATED').
 * Eliminates periodic polling and reduces CPU/RAM load on budget tablets.
 * 
 * @param {object} options
 * @param {Function} options.onEvent - Callback when a delta event arrives: (event) => void
 * @param {Array<string>} options.eventTypes - Filter for specific event types
 */
export function useRealtimeSync({ onEvent = () => {}, eventTypes = [] } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const callbackRef = useRef(onEvent);

  // Keep callback ref updated to prevent unnecessary re-subscriptions
  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const sse = new EventSource('/api/realtime/stream');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      sse.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          
          if (payload.type === 'HEARTBEAT') return;

          // Filter by event type if specified
          if (eventTypes.length === 0 || eventTypes.includes(payload.type)) {
            setLastEvent(payload);
            if (callbackRef.current) {
              callbackRef.current(payload);
            }
          }
        } catch (err) {
          console.error('[Realtime Sync Parse Error]:', err);
        }
      };

      sse.onerror = () => {
        setIsConnected(false);
        sse.close();

        // Exponential backoff reconnection capped at 10s
        const backoff = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
        setReconnectAttempts(prev => prev + 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoff);
      };

    } catch (err) {
      console.error('[Realtime Sync Connection Error]:', err);
      setIsConnected(false);
    }
  }, [eventTypes, reconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastEvent,
    reconnectAttempts,
    reconnect: connect
  };
}

export default useRealtimeSync;
