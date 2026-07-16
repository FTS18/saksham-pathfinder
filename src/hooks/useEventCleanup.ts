import { useEffect, useRef } from 'react';

interface TrackedEventListener {
  element: EventTarget;
  event: string;
  handler: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

export const useEventCleanup = () => {
  const listenersRef = useRef<TrackedEventListener[]>([]);

  const addEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler, options });
  };

  const removeEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject
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