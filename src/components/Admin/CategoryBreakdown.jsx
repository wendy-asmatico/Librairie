import { Link } from "react-router-dom";

const COLORS = ["#7D9C71", "#B8D2A7", "#D0B172", "#90A488", "#E7D7B0", "#57724F", "#C7B282", "#9EB493"];

function buildPieSegments(rayons) {
  let start = 0;
  return rayons.map((rayon, index) => {
    const color = COLORS[index % COLORS.length];
    const segment = `${color} ${start}% ${start + rayon.share}%`;
    start += rayon.share;
    return segment;
  });
}

// Répartition des produits par rayon
export default function CategoryBreakdown({ rayons }) {
  const totalProducts = rayons.reduce((sum, rayon) => sum + rayon.count, 0);
  const pieBackground = rayons.length
    ? `conic-gradient(${buildPieSegments(rayons).join(", ")})`
    : "conic-gradient(#e5ece2 0 100%)";

  return (
    <div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-line bg-white p-6 font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Répartition</p>
          <p className="font-serif text-[22px] leading-[30px] font-bold text-forest-deep">Produits par rayon</p>
        </div>
        <Link to="/admin/produits" className="text-xs leading-4 font-semibold text-gold hover:underline">
          Détails →
        </Link>
      </div>

      {rayons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucun produit à répartir.</p>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="relative size-64 rounded-full" style={{ background: pieBackground }}>
              <div className="absolute inset-10 flex items-center justify-center rounded-full bg-white text-center">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-[0.55px] text-gold uppercase">Total</span>
                  <span className="font-serif text-3xl font-bold text-forest-deep">{totalProducts}</span>
                  <span className="text-xs text-muted">produits</span>
                </div>
              </div>
            </div>
          </div>

          <ul className="flex list-none flex-col gap-2">
            {rayons.map((rayon, index) => (
              <li key={rayon.name} className="flex items-center gap-2 text-[13px] leading-[18px]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate font-semibold text-ink">{rayon.name}</span>
                <span className="text-xs text-muted">{rayon.count}</span>
                <span className="w-10 text-right text-xs font-bold text-forest-deep">{Math.round(rayon.share)} %</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
