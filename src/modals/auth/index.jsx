import AuthForm from "../../components/AuthForm";
import ResetPasswordForm from "../../components/ResetPasswordForm/ResetPasswordForm";

export default function AuthModalContent({ view, ...props }) {
  return view === "reset-password" ? (
    <div className="w-[560px] max-w-full rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-11">
      <ResetPasswordForm {...props} />
    </div>
  ) : (
    <AuthForm view={view} {...props} />
  );
}
