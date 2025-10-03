import { useEffect, useRef } from 'react';

interface EventListener {
  element: EventTarget;
  event: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}

export const useEventCleanup = () => {
  const listenersRef = useRef<EventListener[]>([]);

  const addEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler, options });
  };

  const removeEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.removeEventListener(event, handler);
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  };

  const cleanup = () => {
    listenersRef.current.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        console.warn('Failed to remove event listener:', error);
      }
    });
    listenersRef.current = [];
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return { addEventListener, removeEventListener, cleanup };
};