import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../slices/filtersSlice";
import { fetchProductsThunk } from "../../thunkActionsCreator/productsThunks";
import { decodeHtml } from "../../utils/decodeHtml";

export default function Autocomplete({ placeholder = "Rechercher un livre, un Coran, un tapis, un coffret..." }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search = useSelector((state) => state.filters.search);
  const [focused, setFocused] = useState(false);
  const filters = useSelector((state) => state.filters);
  const { list } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductsThunk({ ...filters, page: 1, per_page: 20 }));
  }, [filters, dispatch]);

  const handleChange = (e) => {
    if (location.pathname !== "/catalogue") {
      dispatch(
        setFilters({
          category: "",
          min_price: "",
          max_price: "",
          search: e.target.value,
        })
      );
    } else {
      dispatch(setFilters({ search: e.target.value }));
    }
  };

  const handleSelect = () => {
    dispatch(setFilters({ search: "" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setFocused(false);
      navigate("/catalogue");
    }
  };

  return (
    <div className="relative w-full h-full font-sans">
      {/* Input de recherche */}
      <input
        type="search"
        className="w-full bg-[#FAF8F5] border border-gray-200 rounded-l-lg py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#785E1A] transition-colors"
        placeholder={placeholder}
        value={search}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Rechercher"
      />

      {/* Liste des suggestions / résultats */}
      {focused && list?.data?.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-80 overflow-y-auto divide-y divide-gray-100 list-none p-0"
          onMouseDown={(e) => e.preventDefault()}
          tabIndex="-1"
        >
          {list.data.map((product) => (
            <li key={product.id}>
              <Link
                to={`/product/${product.id}`}
                onClick={handleSelect}
                tabIndex="-1"
                className="flex items-center gap-3 p-2.5 hover:bg-[#EEF4EC] transition-colors text-decoration-none text-gray-800"
              >
                <img
                  src={
                    product.images[0]?.src ||
                    "https://placeholder.pics/svg/300/DEDEDE/555555/Placeholder"
                  }
                  alt={decodeHtml(product.name) || "Photo du produit"}
                  className="w-10 h-10 object-cover rounded-md border border-gray-100 shrink-0"
                />
                <span className="text-sm font-medium line-clamp-2">
                  {decodeHtml(product.name)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}