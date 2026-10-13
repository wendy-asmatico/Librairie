import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { CloseIcon } from "../Icons";
import { showToast } from "../../slices/toastSlice";
import {
  applyCouponThunk,
  removeCouponThunk,
} from "../../thunkActionsCreator/cartThunks";
import { htmlToText } from "../../utils/decodeHtml";

export default function Coupon() {
  const dispatch = useDispatch();
  const coupons = useSelector((state) => state.cart.coupons);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();
  const feedbackId = useId();

  const applyCoupon = async (event) => {
    event.preventDefault();
    const submittedCode = code.trim();
    if (!submittedCode) {
      setFeedback({ isError: true, message: "Saisissez un code promo." });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(applyCouponThunk({ code: submittedCode })).unwrap();
      setFeedback({
        isError: false,
        message: `Code ${submittedCode.toUpperCase()} appliqué.`,
      });
      setCode("");
    } catch (message) {
      setFeedback({ isError: true, message: htmlToText(message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeCoupon = (couponCode) =>
    dispatch(removeCouponThunk({ code: couponCode }))
      .unwrap()
      .catch((message) => dispatch(showToast(message)));

  return (
    <div className="flex flex-col gap-3">
      <form noValidate onSubmit={applyCoupon} className="flex flex-col">
        <label
          htmlFor={inputId}
          className="mb-2 text-sm leading-none font-semibold text-ink"
        >
          Code promo
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setFeedback(null);
            }}
            placeholder="Saisissez votre code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="done"
            aria-invalid={feedback?.isError || undefined}
            aria-describedby={feedbackId}
            className="h-11.5 min-w-0 flex-1 rounded-lg border border-line-strong bg-white px-3 text-base font-medium text-ink placeholder:text-ink-muted lg:text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11.5 shrink-0 rounded-lg bg-sage px-4.5 text-sm font-semibold text-ink transition-colors enabled:hover:bg-sage-hover disabled:cursor-wait disabled:opacity-60"
          >
            Appliquer
          </button>
        </div>
        <p
          id={feedbackId}
          role="status"
          className={`text-caption font-medium not-empty:mt-2 ${
            feedback?.isError ? "text-danger" : "text-success"
          }`}
        >
          {feedback?.message}
        </p>
      </form>

      {coupons.length > 0 && (
        <ul aria-label="Codes promo appliqués" className="flex flex-wrap gap-2">
          {coupons.map(({ code: couponCode }) => (
            <li
              key={couponCode}
              className="flex items-center gap-1 rounded-full bg-white py-1 pr-1 pl-3 text-caption font-semibold text-ink uppercase ring-1 ring-line-strong"
            >
              {couponCode}
              <button
                type="button"
                aria-label={`Retirer le code ${couponCode.toUpperCase()}`}
                onClick={() => removeCoupon(couponCode)}
                className="flex size-6 items-center justify-center rounded-full bg-transparent text-ink-muted transition-colors hover:bg-mint hover:text-danger"
              >
                <CloseIcon size={12} strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
