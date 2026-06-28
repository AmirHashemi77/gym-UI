import { useEffect, useRef, type RefObject } from 'react';

export function useScrollSentinel(
  onIntersect: () => void,
  enabled: boolean,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin: '120px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
