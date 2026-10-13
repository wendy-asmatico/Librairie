import { Link } from "react-router-dom";
import { WP_ADMIN_URL } from "../../admin/api";
import { initials } from "../../admin/format";

import logo from "../../assets/admin/logo.png";
import icDashboard from "../../assets/admin/nav-dashboard.svg";
import icOrders from "../../assets/admin/nav-orders.svg";
import icPickup from "../../assets/admin/nav-pickup.svg";
import icProducts from "../../assets/admin/nav-products.svg";
import icCategories from "../../assets/admin/nav-categories.svg";
import icGifts from "../../assets/admin/nav-gifts.svg";
import icStock from "../../assets/admin/nav-stock.svg";
import icClients from "../../assets/admin/nav-clients.svg";
import icMessages from "../../assets/admin/nav-messages.svg";
import icReviews from "../../assets/admin/nav-reviews.svg";
import icPromos from "../../assets/admin/nav-promos.svg";
import icSettings from "../../assets/admin/nav-settings.svg";
import dotOnline from "../../assets/admin/dot-online.svg";
import icExternal from "../../assets/admin/ic-external.svg";
import icLogout from "../../assets/admin/ic-logout.svg";

// Les écrans autres que le tableau de bord ouvrent l'admin WooCommerce
const wp = (path) => `${WP_ADMIN_URL}/${path}`;

export default function Sidebar({ badges = {}, user, onLogout, open, onClose }) {
  const groups = [
    {
      title: "Pilotage",
      items: [
        { label: "Tableau de bord", icon: icDashboard, active: true },
        { label: "Commandes", icon: icOrders, href: wp("admin.php?page=wc-orders"), badge: badges.orders },
        {
          label: "Retraits boutique",
          icon: icPickup,
          href: wp("admin.php?page=wc-orders&status=wc-processing"),
          badge: badges.pickups,
        },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { label: "Produits", icon: icProducts, href: wp("edit.php?post_type=product") },
        {
          label: "Rayons & catégories",
          icon: icCategories,
          href: wp("edit-tags.php?taxonomy=product_cat&post_type=product"),
        },
        { label: "Coffrets & devis", icon: icGifts, soon: true },
        { label: "Stocks", icon: icStock, href: wp("edit.php?post_type=product&stock_status=instock") },
      ],
    },
    {
      title: "Relation client",
      items: [
        { label: "Clients", icon: icClients, href: wp("users.php?role=customer") },
        {
          label: "Messages",
          icon: icMessages,
          href: wp("edit.php?post_type=contact_message"),
          badge: badges.messages,
        },
        { label: "Avis clients", icon: icReviews, href: wp("edit.php?post_type=product&page=product-reviews") },
      ],
    },
    {
      title: "Boutique",
      items: [
        { label: "Promotions", icon: icPromos, href: wp("edit.php?post_type=shop_coupon") },
        { label: "Paramètres", icon: icSettings, href: wp("admin.php?page=wc-settings") },
      ],
    },
  ];

  const name = [user?.firstName, user?.lastName?.[0] && `${user.lastName[0]}.`]
    .filter(Boolean)
    .join(" ") || user?.displayName || "Administrateur";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col gap-1 overflow-y-auto bg-forest px-4 pt-7 pb-6 font-sans transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation administrateur"
      >
        <Link to="/admin" className="flex items-center gap-2.5 pb-5 pl-2">
          <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory">
            <span className="relative block h-[29.389px] w-[46px] overflow-hidden">
              <img
                src={logo}
                alt=""
                className="absolute top-[-36.96%] left-[-5.56%] h-[173.91%] w-[111.11%] max-w-none"
              />
            </span>
          </span>
          <span className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="font-serif text-[17px] leading-[22px] font-bold text-white">Maktaba El Hikma</span>
            <span className="text-[10px] leading-[14px] font-semibold tracking-[1px] text-sage">
              ESPACE ADMINISTRATEUR
            </span>
          </span>
        </Link>

        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <p className="pt-[18px] pb-1.5 pl-3 text-[10px] leading-[14px] font-bold tracking-[1.2px] text-sage/70 uppercase">
              {group.title}
            </p>
            {group.items.map((item) => {
              const content = (
                <>
                  <img src={item.icon} alt="" className="size-[18px] shrink-0" />
                  <span
                    className={`flex-1 text-sm leading-5 ${
                      item.active ? "font-bold text-forest" : "font-semibold text-leaf-soft"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.soon && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-leaf-soft">
                      Bientôt
                    </span>
                  )}
                  {item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold ${
                        item.label === "Coffrets & devis" ? "bg-cream text-[#261900]" : "bg-leaf-soft text-[#0d200a]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              );
              const base = "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors";
              if (item.active) {
                return (
                  <span key={item.label} className={`${base} bg-sage`} aria-current="page">
                    {content}
                  </span>
                );
              }
              if (item.soon) {
                return (
                  <span key={item.label} className={`${base} cursor-not-allowed opacity-60`} title="Bientôt disponible">
                    {content}
                  </span>
                );
              }
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={`${base} hover:bg-white/10`}>
                  {content}
                </a>
              );
            })}
          </div>
        ))}

        <div className="min-h-6 flex-1" />

        <div className="flex flex-col gap-1.5 rounded-[14px] border border-sage/25 bg-white/[0.06] p-4">
          <p className="text-[13px] leading-[18px] font-bold text-white">Boutique en ligne</p>
          <p className="flex items-center gap-1.5 text-xs leading-[18px] text-leaf-soft">
            <img src={dotOnline} alt="" className="size-2" />
            En ligne
          </p>
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sage py-[9px] text-xs leading-4 font-semibold tracking-[0.48px] text-white transition-colors hover:bg-[#9cc08f]"
          >
            Voir la boutique
            <img src={icExternal} alt="" className="size-[13px]" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 px-1 pt-4">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-cream text-[13px] leading-[18px] font-bold text-gold">
            {initials(user?.firstName || user?.displayName || "", user?.lastName || "")}
          </span>
          <span className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
            <span className="truncate text-[13px] leading-[18px] font-bold text-white">{name}</span>
            <span className="text-xs leading-4 text-sage">Administration</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded p-1 transition-opacity hover:opacity-70"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <img src={icLogout} alt="" className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
