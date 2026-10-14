import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  registerThunk,
  fetchCurrentUserThunk,
  updateCurrentUserThunk,
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  updateCurrentCustomerThunk,
  deleteCurrentUserThunk,
} from "../thunkActionsCreator/userThunks";

// « Se souvenir de moi » : jeton gardé dans localStorage, sinon le temps de l'onglet
const TOKEN_KEY = "wc_user_token";
const readToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    : null;
const saveToken = (token, remember = true) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};
const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    customer: null,
    orders: [],
    token: readToken(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.profile = null;
      state.customer = null;
      state.orders = [];
      state.token = null;
      clearToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.profile = action.payload.profile;
        saveToken(action.payload.token, action.payload.remember);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.profile = action.payload.profile;
        saveToken(action.payload.token);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(fetchCurrentCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUserOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCurrentUserOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrentCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrentCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(updateCurrentCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrentUserThunk.fulfilled, (state) => {
        state.loading = false;
        // Remet tout l'état utilisateur à zéro (déconnexion automatique)
        state.token = null;
        state.profile = null;
        state.customer = null;
        state.orders = [];
        state.error = null;

        clearToken();
      })
      .addCase(deleteCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
