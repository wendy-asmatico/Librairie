import { WP_ADMIN_URL } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";
import warnRed from "../../assets/admin/warn-red.svg";
import warnGold from "../../assets/admin/warn-gold.svg";

// Bientôt en rupture — maquette 210:186
export default function StockAlerts({ products }) {
  return (
    <div className="flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-line bg-white p-[22px] font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Alerte stock</p>
          <p className="font-serif text-xl leading-7 font-bold text-forest-deep">Bientôt en rupture</p>
        </div>
        <a
          href={`${WP_ADMIN_URL}/edit.php?post_type=product`}
          target="_blank"
          rel="noreferrer"
          className="text-xs leading-4 font-semibold text-gold hover:underline"
        >
          Gérer →
        </a>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucun produit en stock faible.</p>
      ) : (
        products.slice(0, 4).map((p) => {
          const critical = p.stock_quantity <= 2;
          return (
            <a
              key={p.id}
              href={`${WP_ADMIN_URL}/post.php?post=${p.id}&action=edit`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg transition-colors hover:bg-ivory"
            >
              {p.images?.[0]?.src ? (
                <img src={p.images[0].src} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="size-11 shrink-0 rounded-lg bg-mint" />
              )}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] leading-[18px] font-semibold text-ink">{decodeHtml(p.name)}</span>
                <span className="truncate text-xs leading-4 text-muted">
                  {decodeHtml(p.categories?.[0]?.name || "")}
                </span>
              </span>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-[9px] py-[3px] text-[11px] leading-4 font-bold ${
                  critical ? "bg-[#f8dcd5] text-[#8a2c1b]" : "bg-cream text-gold"
                }`}
              >
                <img src={critical ? warnRed : warnGold} alt="" className="size-[11px]" />
                {p.stock_quantity} restant{p.stock_quantity > 1 ? "s" : ""}
              </span>
            </a>
          );
        })
      )}
    </div>
  );
}
