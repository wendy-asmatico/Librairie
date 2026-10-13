import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCategoriesThunk = createAsyncThunk(
  "categories/fetchAll",
  async (_, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/products/categories?_fields=id,name,slug,image,parent,count&per_page=100&hide_empty=false`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Impossible de récupérer les catégories.");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
