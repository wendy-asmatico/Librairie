import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { hideToast } from "../../slices/toastSlice";
import { htmlToText } from "../../utils/decodeHtml";

const DISPLAY_DURATION = 3000;
// Laisse le temps d'atteindre le bouton d'action (« Annuler »...).
const ACTIONABLE_DISPLAY_DURATION = 6000;

/*
 * Notification éphémère. La région live reste montée en permanence pour que
 * chaque message soit annoncé ; le compte à rebours se suspend tant que le
 * pointeur ou le focus est sur le toast. `--toast-offset` le remonte au-dessus
 * d'une barre fixée en bas d'écran (voir StickyCheckoutBar).
 */
export default function Toast() {
  const dispatch = useDispatch();
  const { id, message, action } = useSelector((state) => state.toast);
  // Mémorise l'identifiant du toast suspendu : un nouveau message repart
  // ainsi toujours avec son propre compte à rebours.
  const [pausedToastId, setPausedToastId] = useState(null);
  const isPaused = pausedToastId === id;

  useEffect(() => {
    if (!id || isPaused) return;
    const timeout = setTimeout(
      () => dispatch(hideToast()),
      action ? ACTIONABLE_DISPLAY_DURATION : DISPLAY_DURATION,
    );
    return () => clearTimeout(timeout);
  }, [id, action, isPaused, dispatch]);

  const runAction = () => {
    dispatch(action.intent);
    dispatch(hideToast());
  };

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1.75rem+var(--toast-offset,0rem))] z-1000 flex justify-center px-4 lg:bottom-7"
    >
      {message && (
        <div
          key={id}
          onMouseEnter={() => setPausedToastId(id)}
          onMouseLeave={() => setPausedToastId(null)}
          onFocus={() => setPausedToastId(id)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setPausedToastId(null);
            }
          }}
          className="pointer-events-auto flex w-full max-w-115 items-center gap-3.5 rounded-xl bg-forest py-3.5 pr-3.5 pl-5 text-white shadow-toast motion-safe:animate-rise-in"
        >
          <p className="min-w-0 flex-1 text-sm font-medium">
            {htmlToText(message)}
          </p>
          {action && (
            <button
              type="button"
              onClick={runAction}
              className="h-10 shrink-0 rounded-lg bg-sage px-3.5 text-caption font-bold text-ink transition-colors hover:bg-sage-hover"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
