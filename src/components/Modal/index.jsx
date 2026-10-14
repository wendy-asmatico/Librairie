import { Suspense, lazy, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FocusTrap } from "focus-trap-react";
import { closeModal } from "../../slices/modalSlice";
import "./index.css";

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

  return (
    <div
      className={`modal-overlay ${isOpen ? "modal-open" : "modal-closed"}`}
      onClick={handleClose}
    >
      <FocusTrap active={isOpen}>
        <div
          className={`modal-content ${modalName === "auth" ? "modal-content--bare" : ""}`}
          onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>

          <Suspense
            fallback={<div className="modal-loader">Chargement...</div>}
          >
            {DynamicModal && <DynamicModal {...modalProps} />}
          </Suspense>
        </div>
      </FocusTrap>
    </div>
  );
}
