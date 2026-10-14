import { createSlice } from "@reduxjs/toolkit";
// Importation de la nouvelle action thunk
import {
  fetchBestSellersThunk,
  fetchProductsThunk,
  fetchProductByIdThunk,
} from "../thunkActionsCreator/productsThunks";

export const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: {
      data: [],
      page: 1,
      perPage: 20,
      total: null,
      totalPages: null,
    },
    loading: false,
    error: null,
    bestSellers: [],
    loadingBestSellers: false,
    errorBestSellers: null,
    // Nouveaux états pour stocker les détails d'un seul produit
    singleProduct: null,
    loadingSingle: false,
    errorSingle: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBestSellersThunk.pending, (state) => {
        state.loadingBestSellers = true;
        state.errorBestSellers = null;
      })
      .addCase(fetchBestSellersThunk.fulfilled, (state, action) => {
        state.loadingBestSellers = false;
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellersThunk.rejected, (state, action) => {
        state.loadingBestSellers = false;
        state.errorBestSellers = action.payload;
      })
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, perPage } = action.payload;
        if (page === 1) {
          state.list.data = data;
        } else {
          state.list.data = [...state.list.data, ...data];
        }
        state.list.page = page;
        state.list.perPage = perPage;
        state.list.total = action.payload.total ?? null;
        state.list.totalPages = action.payload.totalPages ?? null;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Nouveaux cas pour le produit unique
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loadingSingle = true;
        state.errorSingle = null;
        state.singleProduct = null;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.loadingSingle = false;
        // Enregistrement des données du produit dans notre nouvelle boîte
        state.singleProduct = action.payload;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loadingSingle = false;
        state.errorSingle = action.payload;
        state.singleProduct = null;
      });
  },
});