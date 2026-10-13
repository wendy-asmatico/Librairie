import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store";

import { initializeCartThunk } from "./thunkActionsCreator/cartThunks";
import {
  fetchCurrentUserThunk,
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
} from "./thunkActionsCreator/userThunks";
import { fetchSiteThunk } from "./thunkActionsCreator/siteThunk";
import { fetchThemeThunk } from "./thunkActionsCreator/themeThunk";
import { fetchWishlistThunk } from "./thunkActionsCreator/wishlistThunks";

import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import BlogPage from "./pages/Blog";
import SinglePost from "./pages/SinglePost";
import Contact from "./pages/Contact";
import LegalMentions from "./pages/LegalMentions";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import Error404 from "./pages/Error404";
import AdminDashboard from "./pages/Admin";

import Layout from "./components/Layout/layout";
import ThemeApplier from "./components/ThemeApplier";
import ScrollToTop from "./components/ScrollToTop";

import "./index.css";

store.dispatch(initializeCartThunk());
store.dispatch(fetchSiteThunk());
store.dispatch(fetchThemeThunk());

if (store.getState().user.token) {
  store.dispatch(fetchCurrentUserThunk());
  store.dispatch(fetchCurrentCustomerThunk());
  store.dispatch(fetchCurrentUserOrdersThunk());
  store.dispatch(fetchWishlistThunk());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <Provider store={store}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
        basename="/ecom"
      >
        <ScrollToTop />
        <ThemeApplier />

        <Routes>
          {/* Espace administrateur : sa propre mise en page (sans en-tête ni pied de boutique) */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Layout parent qui englobe toutes les pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/catalogue" element={<Store />} />
            <Route path="/mentions-legales" element={<LegalMentions />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<SinglePost />} />
            <Route path="/success/:orderId" element={<Success />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>

      </Router>
    </Provider>
  </HelmetProvider>
);