import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/userSlice";
import { useNavigate } from "react-router-dom";

import DeleteAccountButton from "../../components/DeleteAccountButton";
import { UserDisplay } from "../../components/UserDisplay";
import { OrderAll } from "../../components/OrderAll";
import { useEffect } from "react";
import "./index.css";

export default function Profile() {
  const isAuthentificated = useSelector((state) => state.user?.token);
  useEffect(() => {
    !isAuthentificated && navigate("/connexion?redirect=/profile", { replace: true });
  }, [isAuthentificated]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if (isAuthentificated) {
    return (
      <main>
        <div className="profile-container">
          <button
            type="button"
            onClick={() => {
              navigate("/connexion");
              dispatch(logout());
            }}
            className="cursor-pointer self-end rounded-lg border border-line bg-white px-4 py-2.5 font-sans text-[13px] leading-[18px] font-semibold text-gold transition-colors hover:bg-mint-soft"
          >
            Se déconnecter
          </button>
          <UserDisplay />
          <DeleteAccountButton />
          <OrderAll />
        </div>
      </main>
    );
  }
}
