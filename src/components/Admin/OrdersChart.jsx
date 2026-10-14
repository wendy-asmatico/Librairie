import { useState } from "react";
import { longDate } from "../../admin/format";

const CARD =
  "flex flex-col gap-5 overflow-hidden rounded-2xl border border-line bg-white p-6 font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

// Histogramme des commandes quotidiennes — maquette 209:3
export default function OrdersChart({ daily, total, days }) {
  const max = Math.max(...daily.map((d) => d.orders), 0);
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * 4 || 4;
  const peak = daily.reduce((best, d, i) => (d.orders > (daily[best]?.orders ?? -1) ? i : best), 0);
  const [hover, setHover] = useState(null);
  const shown = hover ?? (max > 0 ? peak : null);
  const labelEvery = Math.max(1, Math.round(days / 5));

  return (
    <div className={CARD}>
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Commandes quotidiennes</p>
        <p className="font-serif text-[22px] leading-[30px] font-bold text-forest-deep">
          {total} commande{total > 1 ? "s" : ""} sur {days} jours
        </p>
      </div>

      <div className="relative h-[220px] pl-11" onMouseLeave={() => setHover(null)}>
        {/* Grille + graduations */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="absolute right-0 left-11" style={{ bottom: 28 + (i * 147) / 4 }}>
            <div className={`h-px w-full ${i === 0 ? "bg-[#c7cfc2]" : "bg-[#eef2ea]"}`} />
            <span className="absolute -top-[7px] -left-11 w-[42px] text-right text-[11px] leading-[14px] text-muted">
              {step * i}
            </span>
          </div>
        ))}

        {/* Barres */}
        <div className="absolute right-0 bottom-7 left-11 flex h-[147px] items-end justify-between gap-[3px] px-[3px]">
          {daily.map((d, i) => (
            <button
              type="button"
              key={d.key}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              aria-label={`${longDate(d.date)} : ${d.orders} commandes`}
              className={`w-full max-w-[14px] cursor-pointer rounded-t-[4px] transition-colors ${
                i === shown ? "bg-gold" : "bg-sage hover:bg-[#9cc08f]"
              }`}
              style={{ height: `${(d.orders / top) * 100}%`, minHeight: d.orders ? 3 : 0 }}
            />
          ))}
        </div>

        {/* Dates */}
        <div className="absolute right-0 bottom-0 left-11 flex justify-between px-[3px]">
          {daily.map((d, i) => (
            <span
              key={d.key}
              className={`flex w-0 overflow-visible text-[11px] leading-[14px] whitespace-nowrap text-muted ${
                i === daily.length - 1 ? "justify-end" : i === 0 ? "justify-start" : "justify-center"
              }`}
            >
              {i % labelEvery === 0 || i === daily.length - 1 ? (
                // Sur mobile, une date sur deux seulement pour éviter les chevauchements
                <span className={(i / labelEvery) % 2 === 1 && i !== daily.length - 1 ? "max-sm:hidden" : ""}>
                  {d.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              ) : null}
            </span>
          ))}
        </div>

        {/* Infobulle */}
        {shown !== null && daily[shown] && (
          <div
            className="pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col gap-0.5 rounded-lg bg-forest px-3 py-2 whitespace-nowrap"
            style={{
              left: `clamp(115px, calc(44px + (100% - 44px) * ${(shown + 0.5) / daily.length}), calc(100% - 95px))`,
            }}
          >
            <span className="text-[11px] leading-[14px] text-leaf-soft first-letter:uppercase">
              {longDate(daily[shown].date)}
            </span>
            <span className="text-[13px] leading-[18px] font-bold text-white">
              {daily[shown].orders} commande{daily[shown].orders > 1 ? "s" : ""} · {daily[shown].pickups} retrait
              {daily[shown].pickups > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
