import { useDispatch } from "react-redux";
import { openModal, closeModal } from "../../slices/modalSlice";
import { paymentPrimary, paymentSecondary } from "../../components/PaymentForm/styles";

export default function CheckoutAuthPromptModal() {
  const dispatch = useDispatch();

  return (
    <div>
      <h2 className="mb-4 font-semibold">Créer un compte ou se connecter ?</h2>
      <p className="mb-6">
        Vous êtes actuellement en train de commander en tant qu'invité. Sans
        compte, vous ne pourrez pas suivre votre historique de commande ni
        retrouver cette facture plus tard sur le site.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row [&>button]:flex-1">
        <button
          className={paymentPrimary}
          type="button"
          onClick={() => {
            dispatch(openModal({ name: "auth", props: { view: "login" } }));
          }}
        >
          Se connecter / S'inscrire
        </button>
        <button
          type="button"
          className={paymentSecondary}
          onClick={() => {
            dispatch(closeModal());
            window.dispatchEvent(new Event("checkoutContinueAsGuest"));
          }}
        >
          Continuer sans compte
        </button>
      </div>
    </div>
  );
}
