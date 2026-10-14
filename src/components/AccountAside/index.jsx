import visual from "../../assets/contact/hero.jpg";
import icTick from "../../assets/compte/ic-tick.svg";
import icArrow from "../../assets/compte/ic-arrow.svg";

const PERKS = [
  "Suivi de vos commandes et retraits en boutique",
  "Liste d'envies et coffrets cadeaux enregistrés",
  "Paiement plus rapide, adresses mémorisées",
  "Avant-premières sur les nouveaux arrivages",
];

// Panneau visuel à droite de la modale Connexion / Inscription — maquettes 211:390 et 211:421
export default function AccountAside({ badge, title, text, cta, onClick, gold = false }) {
  return (
    <aside className="relative flex flex-col justify-end gap-4 overflow-hidden rounded-3xl p-6 sm:p-11 lg:w-[500px] lg:shrink-0 lg:self-stretch">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img src={visual} alt="" className="absolute inset-0 size-full object-cover object-[86%_50%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,63,40,0.15)_0%,rgba(45,63,40,0.55)_45%,rgba(45,63,40,0.96)_100%)]" />
      </div>

      <span className="relative mt-24 inline-flex items-center gap-1.5 self-start rounded-full bg-leaf-soft px-3.5 py-1 font-sans text-[11px] leading-4 font-semibold tracking-[0.55px] text-[#0d200a] lg:mt-0">
        <span className="size-2 rounded-[2px] bg-sage" />
        {badge}
      </span>
      <h2 className="relative font-serif text-[26px] leading-[34px] font-bold tracking-[-0.3px] text-white sm:text-[30px] sm:leading-[38px]">
        {title}
      </h2>
      <p className="relative font-sans text-sm leading-[22px] text-line">{text}</p>

      <ul className="relative flex list-none flex-col gap-2.5 pt-1 pb-2">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2.5 font-sans text-[13px] leading-5 text-white">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sage">
              <img src={icTick} alt="" className="size-2.5" />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClick}
        className={`relative inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg px-7 py-[15px] font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white transition-colors ${
          gold ? "bg-gold hover:bg-gold-dark" : "bg-leaf hover:bg-forest"
        }`}
      >
        {cta}
        <img src={icArrow} alt="" className="size-3.5" />
      </button>
    </aside>
  );
}
