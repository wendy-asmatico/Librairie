import { Link } from "react-router-dom";

import icPhone from "../../assets/contact/ic-phone-white.svg";
import icMail from "../../assets/contact/ic-mail-white.svg";
import dotOnline from "../../assets/contact/dot-online.svg";
import icWhatsapp from "../../assets/contact/ic-whatsapp-white.svg";
import icChevron from "../../assets/contact/ic-chevron.svg";
import { BRAND } from "../../brand";

const CARD = "rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
const KICKER = "font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold";

const FAQ = [
  { label: "Modalités et délais d'expédition", to: "/cgv" },
  { label: "Suivre l'état de ma commande", to: "/profile" },
  { label: "Retrait gratuit en boutique", to: "#boutique" },
  { label: "Retours & droit de rétractation", to: "/cgv" },
];

function ContactCard({ icon, kicker, value, href, note }) {
  return (
    <div className={`${CARD} flex items-start gap-4`}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage">
        <img src={icon} alt="" className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={KICKER}>{kicker}</p>
        <a href={href} className="font-sans text-base leading-6 font-bold break-words text-[#444841] hover:text-gold">
          {value}
        </a>
        <p className="font-sans text-[13px] leading-5 text-muted">{note}</p>
      </div>
    </div>
  );
}

// Colonne « Coordonnées » — maquette de Lisa (node 177:62)
export default function ContactInfo() {
  return (
    <aside className="flex flex-col gap-4">
      <ContactCard
        icon={icPhone}
        kicker="SERVICE CLIENT"
        value={BRAND.phone}
        href={BRAND.phoneHref}
        note="Du mardi au dimanche · 10h30 – 19h30"
      />
      <ContactCard
        icon={icMail}
        kicker="PAR EMAIL"
        value={BRAND.email}
        href={`mailto:${BRAND.email}`}
        note="Réponse sous 24 h ouvrées, en français ou en arabe"
      />

      <div className="flex flex-col gap-3 rounded-2xl bg-forest p-7">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-leaf-soft px-3 py-1 font-sans text-[11px] leading-4 font-semibold tracking-[0.55px] text-[#0d200a]">
          <img src={dotOnline} alt="" className="size-2" />
          LIBRAIRE EN LIGNE
        </span>
        <h3 className="font-serif text-2xl leading-8 font-bold text-white">Un conseil immédiat ?</h3>
        <p className="font-sans text-sm leading-[22px] text-leaf-soft">
          Une photo d&apos;un livre, une question sur la taille d&apos;un qamis ou une idée de
          coffret : un libraire vous répond en direct sur WhatsApp.
        </p>
        <a
          href={BRAND.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-sage px-6 py-3.5 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white transition-colors hover:bg-sage-hover"
        >
          <img src={icWhatsapp} alt="" className="size-[15px]" />
          Écrire sur WhatsApp
        </a>
      </div>

      <div className={`${CARD} flex flex-col gap-1`}>
        <p className={KICKER}>QUESTIONS FRÉQUENTES</p>
        <h3 className="font-serif text-xl leading-7 font-bold text-sage">
          Votre réponse est peut-être déjà ici
        </h3>
        <ul className="mt-1.5 mb-1.5 list-none">
          {FAQ.map((item) => {
            const content = (
              <>
                <span className="flex-1">{item.label}</span>
                <img src={icChevron} alt="" className="size-3.5" />
              </>
            );
            const className =
              "flex items-center gap-2 py-[11px] font-sans text-sm leading-[22px] text-[#444841] transition-colors hover:text-gold";
            return (
              <li key={item.label} className="border-b border-line last:border-b-0">
                {item.to.startsWith("#") ? (
                  <a href={item.to} className={className}>{content}</a>
                ) : (
                  <Link to={item.to} className={className}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>
        <Link
          to="/cgv"
          className="self-start font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] text-gold hover:text-gold-dark"
        >
          Voir tout le Centre d&apos;aide →
        </Link>
      </div>
    </aside>
  );
}
