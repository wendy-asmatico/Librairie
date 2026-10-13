import { configureStore } from "@reduxjs/toolkit";

import { cartSlice } from "../slices/cartSlice";
import { productsSlice } from "../slices/productSlice";
import { spotlightSlice } from "../slices/spotlightSlice";
import { categoriesSlice } from "../slices/categoriesSlice";
import { filtersSlice } from "../slices/filtersSlice";
import { userSlice } from "../slices/userSlice";
import { pagesSlice } from "../slices/pagesSlice";
import { blogSlice } from "../slices/blogSlice";
import { siteSlice } from "../slices/siteSlice";
import { toastSlice } from "../slices/toastSlice";
import { modalSlice } from "../slices/modalSlice";
import { wishlistSlice } from "../slices/wishlistSlice";

import { cartIdentityListener } from "./cartIdentityListener";
import { cartRestoreListener } from "./cartRestoreListener";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    cart: cartSlice.reducer,
    categories: categoriesSlice.reducer,
    products: productsSlice.reducer,
    spotlight: spotlightSlice.reducer,
    filters: filtersSlice.reducer,
    pages: pagesSlice.reducer,
    blog: blogSlice.reducer,
    site: siteSlice.reducer,
    toast: toastSlice.reducer,
    modal: modalSlice.reducer,
    wishlist: wishlistSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      cartIdentityListener.middleware,
      cartRestoreListener.middleware,
    ),
});

export default store;