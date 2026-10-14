import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { closeModal } from "../../slices/modalSlice";
import "./index.css";

export default function CheckoutAuthPromptModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="checkout-auth-prompt">
      <h2>Créer un compte ou se connecter ?</h2>
      <p>
        Vous êtes actuellement en train de commander en tant qu'invité. Sans
        compte, vous ne pourrez pas suivre votre historique de commande ni
        retrouver cette facture plus tard sur le site.
      </p>
      <div className="checkout-auth-prompt__buttons">
        <button
          className="login"
          type="button"
          onClick={() => {
            dispatch(closeModal());
            navigate("/connexion?redirect=/commande");
          }}
        >
          Se connecter / S'inscrire
        </button>
        <button
          type="button"
          className="signin"
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
