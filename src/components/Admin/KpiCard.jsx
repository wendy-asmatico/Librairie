import trendUp from "../../assets/admin/trend-up.svg";
import trendDown from "../../assets/admin/trend-down.svg";
import { percent } from "../../admin/format";

// Carte indicateur — maquette 207:143
export default function KpiCard({ label, icon, value, evolution, compareLabel, note }) {
  const up = evolution !== null && evolution !== undefined && evolution >= 0;
  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-white p-[22px] font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[13px] leading-[18px] font-semibold text-muted">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-mint">
          <img src={icon} alt="" className="size-[17px]" />
        </span>
      </div>
      <p className="text-[30px] leading-9 font-extrabold tracking-[-0.5px] text-forest-deep">{value}</p>
      {note ? (
        <p className="text-xs leading-4 text-muted">{note}</p>
      ) : (
        <div className="flex items-center gap-2">
          {evolution !== null && evolution !== undefined ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] leading-4 font-bold ${
                up ? "bg-leaf text-forest-deep" : "bg-cream text-gold"
              }`}
            >
              <img src={up ? trendUp : trendDown} alt="" className="size-3" />
              {percent(evolution)}
            </span>
          ) : (
            <span className="rounded-full bg-mint px-2 py-[3px] text-[11px] leading-4 font-bold text-muted">—</span>
          )}
          <span className="text-xs leading-4 text-muted">{compareLabel}</span>
        </div>
      )}
    </div>
  );
}
