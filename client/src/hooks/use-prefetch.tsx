
import { useEffect } from 'react';

/**
 * Prefetch likely next pages to improve perceived performance
 */
export function usePrefetch(routes: string[]) {
  useEffect(() => {
    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    };

    // Delay prefetch to not interfere with initial load
    const timeoutId = setTimeout(() => {
      routes.forEach(prefetchRoute);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [routes]);
}

/**
 * Hook to prefetch routes on hover
 */
export function usePrefetchOnHover() {
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const route = new URL(link.href).pathname;
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = route;
        document.head.appendChild(prefetchLink);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => document.removeEventListener('mouseenter', handleMouseEnter, true);
  }, []);
}
