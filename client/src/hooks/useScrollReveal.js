import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal(options)
 * 
 * A custom hook that returns:
 *  - A `ref` to attach to the DOM element
 *  - A boolean `isRevealed` that becomes true once the element enters the viewport
 *
 * `options` can include an Intersection Observer config (root, rootMargin, threshold)
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRevealed(true);
        observer.unobserve(el); // Reveal once, then stop observing
      }
    }, options);

    observer.observe(el);

    // Cleanup on unmount
    return () => {
      observer.unobserve(el);
    };
  }, [ref, options]);

  return [ref, isRevealed];
}
