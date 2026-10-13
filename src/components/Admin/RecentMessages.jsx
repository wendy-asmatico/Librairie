import dotUnread from "../../assets/admin/dot-unread.svg";
import dotRead from "../../assets/admin/dot-read.svg";
import { WP_ADMIN_URL } from "../../admin/api";
import { timeAgo } from "../../admin/format";

const INBOX = `${WP_ADMIN_URL}/edit.php?post_type=contact_message`;

// Messages récents — maquette 210:228.
// Messages du formulaire de contact (mu-plugin contact.php), ouverts dans l'admin WordPress.
export default function RecentMessages({ messages = [] }) {
  return (
    <div className="flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-line bg-white p-[22px] font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Formulaire de contact</p>
          <p className="font-serif text-xl leading-7 font-bold text-forest-deep">Messages récents</p>
        </div>
        <a
          href={INBOX}
          target="_blank"
          rel="noreferrer"
          className="text-xs leading-4 font-semibold text-muted transition-colors hover:text-gold"
        >
          Boîte →
        </a>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8 text-center">
          <p className="text-sm font-semibold text-ink">Aucun message pour le moment</p>
          <p className="max-w-[320px] text-xs leading-[18px] text-muted">
            Les messages envoyés depuis la page Contact apparaîtront ici.
          </p>
        </div>
      ) : (
        messages.slice(0, 3).map((m, i) => (
          <a
            key={m.id}
            href={m.edit_url}
            target="_blank"
            rel="noreferrer"
            className={`-mx-2 flex items-start gap-2.5 rounded-lg px-2 transition-colors hover:bg-ivory ${
              i > 0 ? "border-t border-[#eef2ea] pt-3" : ""
            }`}
          >
            <img src={m.unread ? dotUnread : dotRead} alt="" className="h-3.5 w-2 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <div className="flex items-start gap-1.5">
                <p className={`flex-1 text-[13px] leading-[18px] text-ink ${m.unread ? "font-bold" : "font-semibold"}`}>
                  {`${m.firstname} ${m.lastname ? `${m.lastname[0]}.` : ""}`.trim()}
                </p>
                <p className="text-[11px] leading-4 whitespace-nowrap text-muted">{timeAgo(m.date)}</p>
              </div>
              <span className="self-start rounded-full bg-mint px-2 py-0.5 text-[10px] leading-[14px] font-semibold text-forest-deep">
                {m.subject}
              </span>
              <p className="truncate text-xs leading-[18px] text-muted">{m.excerpt}</p>
            </div>
          </a>
        ))
      )}
    </div>
  );
}
