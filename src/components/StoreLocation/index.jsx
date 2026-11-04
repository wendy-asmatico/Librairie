import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_CONTENT = {
  eyebrow: "LIEU DE RENCONTRE & RETRAIT",
  title: "Notre Boutique",
  address: "14 Boulevard de la Sagesse, 13002 Marseille",
  transport: "Métro National • Accès rapide",
  hours: "Du Mardi au Dimanche : 10h30 – 19h30 sans interruption",
  pickup: "Retrait express gratuit pour vos commandes passées sur le site",
  maps_button_text: "Nous trouver sur Google Maps",
  pickup_button_text: "Préparer mon retrait",
  pickup_button_url: "/contact",
  map_query: "13002 Marseille",
};

export default function StoreLocation() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/store-location-settings`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les réglages StoreLocation.");
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
        // Conserve les informations actuelles si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    content.address
  )}`;

  return (
    <section className="bg-[#785E1A] py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto bg-[#EEF4EC] rounded-3xl p-6 sm:p-10 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Colonne Gauche : Infos Boutique */}
          <div className="flex flex-col justify-center">
            {/* Tag Haut */}
            <div className="flex items-center gap-1.5 text-[#785E1A] text-[11px] font-bold tracking-widest uppercase mb-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{content.eyebrow}</span>
            </div>

            {/* Titre */}
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#B1D2AA] mb-6">
              {content.title}
            </h2>

            {/* Liste d'informations */}
            <div className="space-y-4 text-gray-700 text-sm mb-8">
              {/* Adresse */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#785E1A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-bold text-gray-900">{content.address}</p>
                  <p className="text-xs text-gray-500">{content.transport}</p>
                </div>
              </div>

              {/* Horaires */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#785E1A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{content.hours}</p>
              </div>

              {/* Retrait */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#785E1A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p>{content.pickup}</p>
              </div>
            </div>

            {/* Boutons d'actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors shadow-2xs flex items-center gap-2"
              >
                <span>🗺️</span>
                <span>{content.maps_button_text}</span>
              </a>

              <Link
                to={content.pickup_button_url}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-gray-200/80 transition-colors shadow-2xs flex items-center gap-2"
              >
                <span>🕒</span>
                <span>{content.pickup_button_text}</span>
              </Link>
            </div>
          </div>

          {/* Colonne Droite : Carte Google Maps */}
          <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xs border border-gray-200/50">
            <iframe
              title="Localisation Boutique"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(content.map_query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}