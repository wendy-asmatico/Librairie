import hero from "../../assets/enfants/hero.jpg";
import clouds from "../../assets/enfants/clouds.svg";

// Bannière de la page Enfants — maquettes « Catalogue Enfants » (135:36) et « Enfants — mobile » (243:38)
export default function KidsHero() {
  return (
    <section className="relative h-[300px] overflow-hidden lg:h-[564px]">
      <img
        src={hero}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      {/* Mobile : voile sombre + nuages ; ordinateur : fondu vers le blanc */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-[rgba(20,31,18,0.55)] lg:hidden" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(-0.24deg,#fff_8.34%,rgba(246,189,59,0.04)_49.96%)] lg:block" />
      <img
        src={clouds}
        alt=""
        width="391.257"
        height="86.5"
        className="absolute -bottom-1 left-0 h-[86.5px] w-full lg:hidden"
      />

      <h1 className="absolute inset-x-4 top-[150px] text-center font-['Be_Vietnam_Pro',sans-serif] text-[32px] leading-[35px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.45)] lg:top-[269px] lg:-translate-y-1/2 lg:text-[64px] lg:leading-[50px] lg:tracking-[-1px] lg:[text-shadow:none]">
        L’ESPACE DES <br className="lg:hidden" />
        PETITS CROYANTS
      </h1>
    </section>
  );
}
