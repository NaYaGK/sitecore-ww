import { useEffect, useRef, useState } from 'react';

interface UseScrollProgressOptions {
  itemCount: number;
}

interface UseScrollProgressReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  progress: number;
  activeIndex: number;
}

export const useScrollProgress = ({
  itemCount,
}: UseScrollProgressOptions): UseScrollProgressReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Only calculate when container is in viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      // The container has height = itemCount * 100vh
      // When sticky starts (rect.top = 0), progress should be 0
      // As we scroll, the container moves up (rect.top becomes negative)
      // When rect.top = -(containerHeight - viewportHeight), progress should be 1

      const scrollableHeight = containerHeight - viewportHeight;

      if (scrollableHeight <= 0) {
        setProgress(0);
        setActiveIndex(0);
        return;
      }

      // Calculate how far we've scrolled into the container
      // When rect.top = 0 (sticky just started), scrolled = 0
      // When rect.top = -scrollableHeight (sticky ending), scrolled = scrollableHeight
      const scrolled = Math.max(0, -rect.top);
      const currentProgress = Math.min(Math.max(scrolled / scrollableHeight, 0), 1);

      setProgress(currentProgress);

      // Calculate active index based on progress
      // Each item gets equal portion: 1/itemCount
      // Item 0: [0, 1/n), Item 1: [1/n, 2/n), ..., Item n-1: [(n-1)/n, 1]
      const rawIndex = currentProgress * itemCount;
      const index = Math.min(Math.floor(rawIndex), itemCount - 1);

      setActiveIndex(index);
    };

    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [itemCount]);

  return {
    containerRef,
    progress,
    activeIndex,
  };
};
