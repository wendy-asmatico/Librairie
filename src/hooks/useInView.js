import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Suit la présence d'un élément dans le viewport.
 * Renvoie `[ref, inView]` : `ref` se pose sur l'élément à observer.
 */
export default function useInView() {
  const [inView, setInView] = useState(true);
  const observerRef = useRef(null);

  const ref = useCallback((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    observerRef.current = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observerRef.current.observe(node);
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView];
}
