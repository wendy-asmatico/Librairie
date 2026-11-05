import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import icPhone from "../../assets/contact/ic-phone-white.svg";
import icMail from "../../assets/contact/ic-mail-white.svg";
import dotOnline from "../../assets/contact/dot-online.svg";
import icWhatsapp from "../../assets/contact/ic-whatsapp-white.svg";
import icChevron from "../../assets/contact/ic-chevron.svg";

const CARD = "rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
const KICKER = "font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold";

const DEFAULT_CONTENT = {
  phone_kicker: "SERVICE CLIENT",
  phone: "+33 1 42 68 00 00",
  phone_href: "tel:+33142680000",
  phone_note: "Du mardi au dimanche · 10h30 – 19h30",
  email_kicker: "PAR EMAIL",
  email: "contact@maktabaelhikma.fr",
  email_note: "Réponse sous 24 h ouvrées, en français ou en arabe",
  whatsapp_kicker: "LIBRAIRE EN LIGNE",
  whatsapp_title: "Un conseil immédiat ?",
  whatsapp_description:
    "Une photo d’un livre, une question sur la taille d’un qamis ou une idée de coffret : un libraire vous répond en direct sur WhatsApp.",
  whatsapp_button_text: "Écrire sur WhatsApp",
  whatsapp_url: "https://wa.me/33142680000",
  faq_kicker: "QUESTIONS FRÉQUENTES",
  faq_title: "Votre réponse est peut-être déjà ici",
  faq_1_label: "Modalités et délais d’expédition",
  faq_1_url: "/cgv",
  faq_2_label: "Suivre l’état de ma commande",
  faq_2_url: "/profile",
  faq_3_label: "Retrait gratuit en boutique",
  faq_3_url: "#boutique",
  faq_4_label: "Retours & droit de rétractation",
  faq_4_url: "/cgv",
  faq_all_text: "Voir tout le Centre d’aide →",
  faq_all_url: "/cgv",
};

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
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/contact-info-settings`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les réglages ContactInfo.");
        return response.json();
      })
      .then((data) => {
        setContent((current) =>
          Object.fromEntries(
            Object.keys(current).map((key) => [key, data[key]?.trim?.() || current[key]]),
          ),
        );
      })
      .catch(() => {
        // Garde les coordonnées actuelles si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  const faqItems = [1, 2, 3, 4].map((number) => ({
    label: content[`faq_${number}_label`],
    to: content[`faq_${number}_url`],
  }));

  return (
    <aside className="flex flex-col gap-4">
      <ContactCard
        icon={icPhone}
        kicker={content.phone_kicker}
        value={content.phone}
        href={content.phone_href}
        note={content.phone_note}
      />
      <ContactCard
        icon={icMail}
        kicker={content.email_kicker}
        value={content.email}
        href={`mailto:${content.email}`}
        note={content.email_note}
      />

      <div className="flex flex-col gap-3 rounded-2xl bg-forest p-7">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-leaf-soft px-3 py-1 font-sans text-[11px] leading-4 font-semibold tracking-[0.55px] text-[#0d200a]">
          <img src={dotOnline} alt="" className="size-2" />
          {content.whatsapp_kicker}
        </span>
        <h3 className="font-serif text-2xl leading-8 font-bold text-white">{content.whatsapp_title}</h3>
        <p className="font-sans text-sm leading-[22px] text-leaf-soft">
          {content.whatsapp_description}
        </p>
        <a
          href={content.whatsapp_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-sage px-6 py-3.5 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white transition-colors hover:bg-sage-hover"
        >
          <img src={icWhatsapp} alt="" className="size-[15px]" />
          {content.whatsapp_button_text}
        </a>
      </div>

      <div className={`${CARD} flex flex-col gap-1`}>
        <p className={KICKER}>{content.faq_kicker}</p>
        <h3 className="font-serif text-xl leading-7 font-bold text-sage">
          {content.faq_title}
        </h3>
        <ul className="mt-1.5 mb-1.5 list-none">
          {faqItems.map((item) => {
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
                {item.to.startsWith("/") ? (
                  <Link to={item.to} className={className}>{content}</Link>
                ) : (
                  <a href={item.to} className={className}>{content}</a>
                )}
              </li>
            );
          })}
        </ul>
        <Link
          to={content.faq_all_url}
          className="self-start font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] text-gold hover:text-gold-dark"
        >
          {content.faq_all_text}
        </Link>
      </div>
    </aside>
  );
}
