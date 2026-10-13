import dotUnread from "../../assets/admin/dot-unread.svg";
import dotRead from "../../assets/admin/dot-read.svg";

// Messages récents — maquette 210:228.
// Le back du formulaire de contact n'existe pas encore (ticket US-1177) :
// le composant affiche les messages qu'on lui passe, sinon un état vide.
export default function RecentMessages({ messages = [] }) {
  return (
    <div className="flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-line bg-white p-[22px] font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Formulaire de contact</p>
          <p className="font-serif text-xl leading-7 font-bold text-forest-deep">Messages récents</p>
        </div>
        <span className="text-xs leading-4 font-semibold text-muted">Boîte →</span>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8 text-center">
          <p className="text-sm font-semibold text-ink">Aucun message pour le moment</p>
          <p className="max-w-[320px] text-xs leading-[18px] text-muted">
            Les messages du formulaire de contact apparaîtront ici une fois son envoi branché (US-1177).
          </p>
        </div>
      ) : (
        messages.slice(0, 3).map((m, i) => (
          <div key={m.id} className={`flex items-start gap-2.5 ${i > 0 ? "border-t border-[#eef2ea] pt-3" : ""}`}>
            <img src={m.unread ? dotUnread : dotRead} alt="" className="h-3.5 w-2 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <div className="flex items-start gap-1.5">
                <p className={`flex-1 text-[13px] leading-[18px] text-ink ${m.unread ? "font-bold" : "font-semibold"}`}>
                  {m.author}
                </p>
                <p className="text-[11px] leading-4 whitespace-nowrap text-muted">{m.when}</p>
              </div>
              <span className="self-start rounded-full bg-mint px-2 py-0.5 text-[10px] leading-[14px] font-semibold text-forest-deep">
                {m.subject}
              </span>
              <p className="truncate text-xs leading-[18px] text-muted">{m.excerpt}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
