import { Suspense, lazy, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FocusTrap } from "focus-trap-react";
import { closeModal } from "../../slices/modalSlice";

const modalModules = import.meta.glob("../../modals/*/index.jsx");

export default function Modal() {
  const dispatch = useDispatch();
  const { isOpen, modalName, modalProps } = useSelector((state) => state.modal);

  const DynamicModal = useMemo(() => {
    if (!modalName) return null;

    const importFn = modalModules[`../../modals/${modalName}/index.jsx`];

    if (!importFn) {
      console.error(`Modal "${modalName}" not found in src/modals/`);
      return null;
    }

    return lazy(importFn);
  }, [modalName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !DynamicModal) return null;

  const handleClose = () => dispatch(closeModal());

  const isBare = modalName === "auth";

  return (
    <div
      className={`fixed inset-0 z-[999] animate-fade-in items-center justify-center bg-black/55 ${
        isOpen ? "flex" : "hidden"
      }`}
      onClick={handleClose}
    >
      <FocusTrap active={isOpen}>
        <div
          className={`relative animate-rise-in overflow-y-auto ${
            isBare
              ? "max-h-[92lvh] max-w-[min(1184px,calc(100vw-32px))] rounded-3xl"
              : "max-h-[80%] max-w-[80%] rounded-2xl bg-white p-[4lvh] shadow-[0_20px_60px_rgb(0_0_0/0.2)] [&>:nth-child(2)]:mt-[3lvh]"
          }`}
          onClick={(e) => e.stopPropagation()}>
          <button
            className={`absolute cursor-pointer border-0 bg-transparent text-ink ${
              isBare
                ? "top-4 right-5 z-[1] text-[28px] lg:text-white lg:[text-shadow:0_1px_4px_rgb(0_0_0/0.45)]"
                : "top-[1lvh] right-[1lvh] text-[5lvh]"
            }`}
            onClick={handleClose}
            aria-label="Fermer"
          >
            ✕
          </button>

          <Suspense
            fallback={
              <div className="flex h-[40lvh] items-center justify-center font-medium text-ink">
                Chargement...
              </div>
            }
          >
            {DynamicModal && <DynamicModal {...modalProps} />}
          </Suspense>
        </div>
      </FocusTrap>
    </div>
  );
}
