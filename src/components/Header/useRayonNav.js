import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { RAYONS } from "../../brand";

// Liens du menu : Accueil, Nouveautés puis les rayons de la maquette.
// Les rayons ouvrent le catalogue filtré par slug de catégorie WooCommerce.
export const NAV_ITEMS = [
  { key: "home", label: "Accueil", to: "/" },
  { key: "new", label: "Nouveautés", sort: true },
  ...RAYONS,
];

export default function useRayonNav(onNavigate) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);

  const isActive = (item) => {
    if (item.to) return location.pathname === item.to;
    if (location.pathname !== "/catalogue") return false;
    if (item.sort) return !filters.category && !filters.search;
    const cat = categories.find((c) => String(c.id) === filters.category);
    return filters.category === item.slug || cat?.slug === item.slug;
  };

  const goTo = (item) => {
    onNavigate?.();
    if (item.to) {
      navigate(item.to);
      return;
    }
    dispatch(
      setFilters({
        category: item.slug || "",
        search: "",
        ...(item.sort ? { orderby: "date", order: "desc" } : {}),
      }),
    );
    navigate("/catalogue");
  };

  return { items: NAV_ITEMS, isActive, goTo };
}
