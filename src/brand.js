// Identité Maktaba El Hikma (maquettes de Lisa) — remplace les infos
// de la boutique de démo renvoyées par WordPress.
import logoRound from "./assets/images/logo-round.jpg";

export const BRAND = {
  name: "Maktaba El Hikma",
  shortName: "Maktabaelhikma",
  tagline: "Librairie & boutique islamique",
  description:
    "Librairie et boutique islamique : Corans, livres, vêtements, parfums et coffrets cadeaux. Retrait gratuit en boutique.",
  phone: "+33 1 42 68 00 00",
  phoneHref: "tel:+33142680000",
  whatsappHref: "https://wa.me/33142680000",
  email: "contact@maktabaelhikma.fr",
  address: "14 Boulevard de la Sagesse, 75011 Paris",
  hours: "Du Mardi au Dimanche : 10h30 - 19h30",
  favicon: logoRound,
};

// Palette de la maquette, appliquée en variables CSS par ThemeApplier
export const PALETTE = {
  "--primary-color": "#b2d1a7",
  "--primary-color-light": "#2d3f28",
  "--secondary-color": "#775a19",
  "--surface-color": "#eef6ea",
  "--text-color-muted": "#444841",
  "--danger-color": "#ba1a1a",
  "--success-color": "#44563e",
  "--bg-color": "#f4fcf0",
  "--white-color": "#ffffff",
  "--dark-color": "#2b4a33",
  "--font-body": "'Plus Jakarta Sans', sans-serif",
  "--font-heading": "'Plus Jakarta Sans', sans-serif",
};

// Rayons de la maquette. Le slug sert de filtre WooCommerce (la Store API
// accepte les slugs) : il suffit de créer les catégories avec ces slugs.
export const RAYONS = [
  { key: "books", label: "Livres & Coran", slug: "livres-coran", chevron: true },
  { key: "clothes", label: "Vêtements", slug: "vetements", chevron: true },
  { key: "accessories", label: "Accessoires", slug: "accessoires", chevron: true },
  { key: "kids", label: "Enfants", slug: "enfants" },
  { key: "gifts", label: "Coffrets Cadeaux", slug: "coffrets-cadeaux" },
];

export const rayonBySlug = (slug) => RAYONS.find((r) => r.slug === slug);
