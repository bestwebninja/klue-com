import { useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { BrowserRouter } from 'react-router-dom';

/**
 * A hook that manages React-rendered Mapbox popups with proper cleanup.
 * Returns a function to create popups that render React components.
 */
export function useReactMapPopup() {
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const rootRef = useRef<Root | null>(null);

  const showPopup = useCallback(
    (
      map: mapboxgl.Map,
      lngLat: [number, number],
      content: React.ReactNode,
      options?: mapboxgl.PopupOptions
    ) => {
      // Clean up existing popup and React root
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      // Create container for React content
      const container = document.createElement('div');
      container.className = 'mapbox-react-popup';

      // Create React root and render content
      rootRef.current = createRoot(container);
      rootRef.current.render(
        <BrowserRouter>{content}</BrowserRouter>
      );

      // Create and show popup
      popupRef.current = new mapboxgl.Popup({
        offset: 15,
        maxWidth: '300px',
        closeButton: true,
        closeOnClick: true,
        ...options,
      })
        .setLngLat(lngLat)
        .setDOMContent(container)
        .addTo(map);

      // Cleanup React root when popup closes
      popupRef.current.on('close', () => {
        if (rootRef.current) {
          // Defer unmount to avoid React warnings about unmounting during render
          setTimeout(() => {
            rootRef.current?.unmount();
            rootRef.current = null;
          }, 0);
        }
      });
    },
    []
  );

  const closePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
  }, []);

  return { showPopup, closePopup };
}
