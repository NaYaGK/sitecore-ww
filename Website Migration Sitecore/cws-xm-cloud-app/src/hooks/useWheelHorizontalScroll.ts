'use client';

import { useEffect, type RefObject } from 'react';

interface WheelOptions {
  speed?: number;
  propagateAtEdges?: boolean;
}

/**
 * Translates vertical mouse wheel movement into horizontal scrolling for the supplied element.
 * Works for both mouse wheels (deltaY) and trackpads (deltaX/deltaY).
 *
 * @param ref - Ref to the horizontally scrollable element.
 * @param options.speed - Multiplier applied to the wheel delta (default 1).
 * @param options.propagateAtEdges - Allow the event to bubble when the element is already at either edge (default true).
 */
export function useWheelHorizontalScroll<T extends HTMLElement>(
  ref: RefObject<T>,
  options?: WheelOptions
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const speed = options?.speed ?? 1;
    const propagateAtEdges = options?.propagateAtEdges ?? true;

    const onWheel = (event: WheelEvent) => {
      const canScroll = el.scrollWidth > el.clientWidth;
      if (!canScroll) return;

      const delta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (delta === 0) return;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      if (propagateAtEdges && ((delta < 0 && atStart) || (delta > 0 && atEnd))) {
        return;
      }

      let adjustedDelta = delta;

      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        adjustedDelta *= 32;
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        adjustedDelta *= el.clientWidth;
      }

      event.preventDefault();
      el.scrollLeft += adjustedDelta * speed;
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel as EventListener);
    };
  }, [ref, options?.speed, options?.propagateAtEdges]);
}


