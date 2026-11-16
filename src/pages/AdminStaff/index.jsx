import { useCallback, useEffect, useState } from "react";
import DetailLayout, { DETAIL_BUTTON, DETAIL_CARD, DETAIL_INPUT, useAdminAccess } from "../../components/Admin/DetailLayout";
import { customCreate, customFetch } from "../../admin/api";

const EMPTY_FORM = { first_name: "", last_name: "", email: "", role: "shop_manager" };

export default function AdminStaff() {
  const access = useAdminAccess();
  const [values, setValues] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [staff, setStaff] = useState({ loading: true, error: "", items: [], totalPages: 0 });
  const [actionId, setActionId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const isAdministrator = access.profile?.roles?.includes("administrator");

  const loadStaff = useCallback(async () => {
    const data = await customFetch("/admin/staff", access.token, { page });
    if (!Array.isArray(data?.items)) throw new Error("Réponse de la liste d’équipe invalide.");
    return data;
  }, [access.token, page]);

  useEffect(() => {
    if (!access.token || !access.isAdmin) return;
    let active = true;
    setStaff((current) => ({ ...current, loading: true, error: "" }));
    loadStaff().then((data) => {
      if (!active) return;
      if (page > 1 && page > data.total_pages) {
        setPage(Math.max(1, data.total_pages));
        return;
      }
      setStaff({ loading: false, error: "", items: data.items, totalPages: data.total_pages });
    }).catch((loadError) => {
      if (active) setStaff({ loading: false, error: loadError.message, items: [], totalPages: 0 });
    });
    return () => { active = false; };
  }, [access.token, access.isAdmin, loadStaff, page, revision]);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const roleLabel = values.role === "administrator" ? "administrateur WordPress" : "gestionnaire de boutique";
    if (!window.confirm(`Créer un compte ${roleLabel} pour ${values.email.trim()} ?`)) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await customCreate("/admin/staff", access.token, {
        ...values,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
      });
      setResult(response);
      setValues(EMPTY_FORM);
      setPage(1);
      setRevision((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Impossible de créer le compte.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member, action) => {
    if (actionId !== null) return;
    const prompt = action === "delete"
      ? `Supprimer définitivement le compte de ${member.name} (${member.email}) ? Ses contenus WordPress seront réattribués à votre compte.`
      : `Retirer les droits de ${member.name} (${member.email}) ? Son compte restera accessible avec le rôle client.`;
    if (!window.confirm(prompt)) return;
    setActionId(member.id);
    setActionError("");
    setActionMessage("");
    try {
      await customCreate(`/admin/staff/${member.id}/remove`, access.token, { action });
      setActionMessage(action === "delete" ? "Compte supprimé." : "Droits retirés ; le compte est désormais client.");
      setRevision((value) => value + 1);
    } catch (requestError) {
      setActionError(requestError.message || "Impossible de modifier ce compte.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <DetailLayout access={access} title="Équipe" backTo="/admin" backLabel="Retour au tableau de bord">
      <section className={`${DETAIL_CARD} mb-5`}>
        <h2 className="text-lg font-bold text-forest-deep">Membres de l’équipe</h2>
        <p className="mt-2 text-sm text-ink">
          Administrateurs et gestionnaires de boutique. Seuls les administrateurs peuvent retirer les droits ou supprimer un compte.
        </p>
        <p className="mt-2 text-sm text-ink">
          Les gestionnaires peuvent toutefois créer un nouvel administrateur et ont donc indirectement tous les droits WordPress.
        </p>
        {actionMessage && <p role="status" className="mt-3 text-sm text-forest">{actionMessage}</p>}
        {actionError && <p role="alert" className="mt-3 text-sm text-[#8a2c1b]">{actionError}</p>}
        {staff.loading ? <p role="status" className="mt-4 text-sm">Chargement de l’équipe…</p> : staff.error ? (
          <div role="alert" className="mt-4 text-sm">
            Impossible de charger l’équipe : {staff.error}{" "}
            <button type="button" onClick={() => setRevision((value) => value + 1)} className="font-semibold underline">Réessayer</button>
          </div>
        ) : staff.items.length === 0 ? <p className="mt-4 text-sm">Aucun membre trouvé.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead><tr className="border-b border-line"><th className="py-3 pr-4">Nom</th><th className="py-3 pr-4">E-mail</th><th className="py-3 pr-4">Rôle</th><th className="py-3">Actions</th></tr></thead>
              <tbody>
                {staff.items.map((member) => (
                  <tr key={member.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-semibold">{member.name}</td>
                    <td className="break-all py-3 pr-4">{member.email}</td>
                    <td className="py-3 pr-4">{member.roles.map((role) => role === "administrator" ? "Administrateur" : "Gestionnaire").join(", ")}</td>
                    <td className="py-3">
                      {member.id === access.profile?.id ? <span className="text-muted">Votre compte</span> : isAdministrator ? (
                        <div className="flex flex-wrap gap-3">
                          <button type="button" disabled={actionId !== null} onClick={() => remove(member, "revoke")} className="font-semibold text-secondary underline disabled:opacity-50">Retirer les droits</button>
                          <button type="button" disabled={actionId !== null} onClick={() => remove(member, "delete")} className="font-semibold text-danger underline disabled:opacity-50">Supprimer</button>
                        </div>
                      ) : <span className="text-muted">Réservé aux administrateurs</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {staff.totalPages > 1 && !staff.loading && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="font-semibold text-secondary disabled:opacity-40">Précédent</button>
            <span>Page {page} / {staff.totalPages}</span>
            <button type="button" disabled={page >= staff.totalPages} onClick={() => setPage((value) => value + 1)} className="font-semibold text-secondary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </section>
      <section className={`${DETAIL_CARD} max-w-2xl`}>
        <h2 className="text-lg font-bold text-forest-deep">Ajouter un membre de l’équipe</h2>
        <p className="mt-2 text-sm text-ink">
          La personne reçoit un e-mail pour définir son mot de passe. Un gestionnaire peut utiliser le tableau de bord et créer à son tour des administrateurs.
        </p>
        <p className="mt-3 rounded-lg bg-[#fff5e3] p-3 text-sm text-ink">
          Un administrateur dispose de tous les droits WordPress, y compris sur les utilisateurs et les réglages. Le droit de créer un administrateur donne donc indirectement ces droits aux gestionnaires.
        </p>
        {result && (
          <p role={result.email_sent ? "status" : "alert"} className="mt-4 rounded-lg bg-mint p-3 text-sm text-forest">
            {result.email_sent
              ? "Compte créé. L’e-mail de création du mot de passe a été envoyé."
              : "Compte créé, mais l’e-mail n’a pas pu être envoyé. Ne créez pas un second compte : vérifiez la configuration des e-mails et utilisez « Mot de passe oublié »."}
          </p>
        )}
        {error && <p role="alert" className="mt-4 rounded-lg bg-[#fff5f2] p-3 text-sm text-[#8a2c1b]">{error}</p>}
        <form onSubmit={submit} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Prénom
              <input className={`${DETAIL_INPUT} mt-1`} name="first_name" value={values.first_name} onChange={update} autoComplete="given-name" required />
            </label>
            <label className="text-sm font-semibold">Nom
              <input className={`${DETAIL_INPUT} mt-1`} name="last_name" value={values.last_name} onChange={update} autoComplete="family-name" required />
            </label>
          </div>
          <label className="text-sm font-semibold">Adresse e-mail
            <input className={`${DETAIL_INPUT} mt-1`} name="email" type="email" value={values.email} onChange={update} autoComplete="email" required />
          </label>
          <label className="text-sm font-semibold">Rôle
            <select className={`${DETAIL_INPUT} mt-1`} name="role" value={values.role} onChange={update}>
              <option value="shop_manager">Gestionnaire de boutique</option>
              <option value="administrator">Administrateur WordPress</option>
            </select>
          </label>
          <button type="submit" disabled={busy} className={`${DETAIL_BUTTON} justify-self-start`}>
            {busy ? "Création…" : "Créer le compte"}
          </button>
        </form>
      </section>
    </DetailLayout>
  );
}
