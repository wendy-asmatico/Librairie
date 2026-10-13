import { WP_ADMIN_URL } from "../../admin/api";

// Commandes par rayon — maquette 209:62
export default function CategoryBreakdown({ rayons }) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-6 font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Répartition</p>
          <p className="font-serif text-[22px] leading-[30px] font-bold text-forest-deep">Commandes par rayon</p>
        </div>
        <a
          href={`${WP_ADMIN_URL}/admin.php?page=wc-admin&path=/analytics/categories`}
          target="_blank"
          rel="noreferrer"
          className="text-xs leading-4 font-semibold text-gold hover:underline"
        >
          Détails →
        </a>
      </div>

      {rayons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucune vente sur la période.</p>
      ) : (
        <ul className="flex list-none flex-col gap-4">
          {rayons.map((r) => (
            <li key={r.name} className="flex flex-col gap-[7px]">
              <div className="flex items-center gap-2 text-[13px] leading-[18px]">
                <span className="flex-1 truncate font-semibold text-ink">{r.name}</span>
                <span className="text-xs text-muted">{r.count} cmd</span>
                <span className="w-9 text-right text-xs font-bold text-forest-deep">{Math.round(r.share)} %</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mint">
                <div className="h-full rounded-full bg-sage" style={{ width: `${Math.max(r.share, 2)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
