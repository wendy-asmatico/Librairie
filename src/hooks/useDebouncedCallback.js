import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

/**
 * Regroupe des appels rapprochés : `callback` ne part qu'après `delay` ms sans
 * nouvel appel. La fonction renvoyée expose `cancel()` et `flush()` ; un appel
 * encore en attente est exécuté au démontage, aucune saisie n'est perdue.
 */
export default function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const debounced = useMemo(() => {
    let timeoutId;
    let pendingArgs = null;

    const run = (...args) => {
      clearTimeout(timeoutId);
      pendingArgs = args;
      timeoutId = setTimeout(run.flush, delay);
    };
    run.cancel = () => {
      clearTimeout(timeoutId);
      pendingArgs = null;
    };
    run.flush = () => {
      clearTimeout(timeoutId);
      if (!pendingArgs) return;
      const args = pendingArgs;
      pendingArgs = null;
      callbackRef.current(...args);
    };

    return run;
  }, [delay]);

  useEffect(() => debounced.flush, [debounced]);

  return debounced;
}
