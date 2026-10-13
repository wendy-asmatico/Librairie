import heroImage from "../../assets/contact/hero.jpg";
import icArrow from "../../assets/contact/ic-arrow.svg";
import icWhatsapp from "../../assets/contact/ic-whatsapp-gold.svg";
import { BRAND } from "../../brand";

const BTN =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg px-6 py-4 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] transition-colors";

// Bannière de la page Contact — maquette de Lisa (node 177:2)
export default function ContactHero({ onWrite }) {
  return (
    <section className="relative overflow-hidden px-4 py-10 lg:min-h-[460px] lg:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full max-w-none object-cover object-[75%_50%] lg:top-[-31.45%] lg:left-[-33.33%] lg:h-[157.23%] lg:w-[133.33%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,252,240,0.92)_0%,rgba(244,252,240,0.8)_30%,rgba(244,252,240,0.35)_48%,rgba(244,252,240,0)_62%),linear-gradient(90deg,#fff_0%,rgba(121,65,0,0.1)_52.266%)] max-lg:bg-[linear-gradient(90deg,rgba(244,252,240,0.94)_0%,rgba(244,252,240,0.75)_100%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1184px] flex-col items-start lg:pt-10">
        <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-leaf-soft px-4 py-1 font-sans text-[11px] leading-4 font-semibold tracking-[0.55px] text-[#0d200a] uppercase">
          <span className="size-2 rounded-full bg-sage" />
          Service client — Contact &amp; conseil
        </span>

        <h1 className="mb-4 font-serif text-[31px] leading-[1.2] font-bold tracking-[-1px] text-black lg:text-[40px] lg:leading-[50px]">
          Une question ?
          <br />
          Nous sommes à votre écoute
        </h1>

        <p className="mb-7 max-w-[500px] font-sans text-sm leading-[22px] text-black lg:text-base lg:leading-[26px]">
          Commande, coffret sur mesure, conseil de lecture ou devis pour votre association :
          notre équipe de libraires vous répond avec soin, en français comme en arabe.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={onWrite}
            className={`${BTN} bg-sage text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-forest`}
          >
            Écrire un message
            <img src={icArrow} alt="" className="size-[9.333px]" />
          </button>
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={`${BTN} bg-white text-gold shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-cream`}
          >
            <img src={icWhatsapp} alt="" className="size-3.5" />
            WhatsApp Conseil Direct
          </a>
        </div>
      </div>
    </section>
  );
}
