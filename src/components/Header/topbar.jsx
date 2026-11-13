import { useEffect, useState } from "react";

const DEFAULT_CONTENT = {
  left_main_text: "Livraison sous 1 semaine ou",
  left_highlight_text: "Retrait gratuit en boutique",
  left_secondary_text: "Paiement 100% sécurisé",
  phone_label: "Service client :",
  phone_value: "+33 7 83 76 84 16",
  phone_href: "tel:+33783768416",
  whatsapp_label: "WhatsApp Conseil Direct",
  whatsapp_url: "https://wa.me/33783768416",
};

export default function TopBar() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/topbar-settings`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les réglages du topbar.");
        return response.json();
      })
      .then((data) => {
        setContent((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(current).map(([key, value]) => {
              const nextValue = data[key];
              if (typeof nextValue === "string") {
                return [key, nextValue.trim() || value];
              }

              return [key, value];
            }),
          ),
        }));
      })
      .catch(() => {
        // Garde les valeurs par défaut si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  const hasSecondaryText = Boolean(content.left_secondary_text?.trim());

  return (
    <div className="bg-primary-hover text-white text-xs font-sans border-b border-black/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 p-3">
        <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-[#D0B172] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
              <path d="M12 6c-3 3-3 7 0 10" />
              <path d="M12 11c2-2 4-2 5 0" />
            </svg>
            <span className="text-[#E2E8E0]">
              {content.left_main_text && <>{content.left_main_text} </>}
              {content.left_highlight_text && (
                <strong className="font-bold text-white">{content.left_highlight_text}</strong>
              )}
            </span>
          </span>

          {hasSecondaryText && (
            <>
              <span className="hidden md:inline opacity-40 text-white">|</span>
              <span className="text-white">{content.left_secondary_text}</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-6 text-[12px]">
          <a
            href={content.phone_href || "tel:+33783768416"}
            className="hover:text-[#D0B172] transition-colors flex items-center gap-2 text-[#E2E8E0]"
          >
            <svg
              className="w-4 h-4 text-[#D0B172] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>
              {content.phone_label} {content.phone_value}
            </span>
          </a>

          <a
            href={content.whatsapp_url || "https://wa.me/33783768416"}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#D0B172] transition-colors flex items-center gap-2 text-[#E2E8E0]"
          >
            <svg
              className="w-4 h-4 text-[#D0B172] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="8" y1="9" x2="16" y2="9" />
              <line x1="8" y1="13" x2="14" y2="13" />
            </svg>
            <span>{content.whatsapp_label}</span>
          </a>
        </div>
      </div>
    </div>
  );
}