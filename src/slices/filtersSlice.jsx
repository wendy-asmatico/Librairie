import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  category: "",
  min_price: "",
  max_price: "",
  stock_status: "", // "instock" = disponibles uniquement
  orderby: "date",
  order: "desc",
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // Permet de mettre à jour un ou plusieurs filtres d'un coup
    setFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    // Pour tout réinitialiser (pratique si tu as un bouton "Reset")
    //resetFilters: () => initialState,
  },
});

export const { setFilters /*, resetFilters*/ } = filtersSlice.actions;
