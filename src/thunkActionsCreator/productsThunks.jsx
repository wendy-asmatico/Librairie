import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBestSellersThunk = createAsyncThunk(
  "products/fetchBestSellers",
  async (_, thunkAPI) => {
    try {
      const queryString = new URLSearchParams({
        page: "1",
        per_page: "4",
        orderby: "popularity",
        order: "desc",
      }).toString();
      const url = `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products?${queryString}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les meilleures ventes.");
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const page = params.page ? parseInt(params.page, 10) : 1;
      const perPage = params.per_page ? parseInt(params.per_page, 10) : 20;
      const minPrice =
        params.min_price !== undefined &&
        params.min_price !== null &&
        params.min_price !== ""
          ? Math.round(parseFloat(params.min_price) * 100)
          : undefined;
      const maxPrice =
        params.max_price !== undefined &&
        params.max_price !== null &&
        params.max_price !== ""
          ? Math.round(parseFloat(params.max_price) * 100)
          : undefined;
      const cleanParams = Object.entries({
        ...params,
        page,
        per_page: perPage,
        min_price: minPrice,
        max_price: maxPrice,
      }).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      }, {});
      const queryString = new URLSearchParams(cleanParams).toString();
      const url = `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products?${queryString}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Impossible de récupérer les produits.");
      }
      const data = await response.json();
      // Totaux exposés par la Store API (relayés par mu-plugins/products.php)
      const total = parseInt(response.headers.get("X-WP-Total"), 10);
      const totalPages = parseInt(response.headers.get("X-WP-TotalPages"), 10);

      return {
        data,
        page,
        perPage,
        total: Number.isNaN(total) ? null : total,
        totalPages: Number.isNaN(totalPages) ? null : totalPages,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Suggestions de recherche (autocomplétion du Header) : état séparé de
// products.list pour ne pas écraser le catalogue ni les produits du slider.
export const fetchSearchSuggestionsThunk = createAsyncThunk(
  "products/fetchSearchSuggestions",
  async ({ search, per_page = 5 } = {}, thunkAPI) => {
    try {
      const queryString = new URLSearchParams({
        search: search || "",
        per_page: String(per_page),
      }).toString();
      const url = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/products?${queryString}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Impossible de récupérer les suggestions.");
      }
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Action pour récupérer un seul produit par son ID
export const fetchProductByIdThunk = createAsyncThunk(
  "products/fetchById",
  async (productId, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products/${productId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Capture du message d'erreur réel de WooCommerce s'il existe
        const errorData = await response.json().catch(() => ({}));
        const serverMessage =
          errorData.message || "Impossible de récupérer le produit.";
        throw new Error(serverMessage);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
