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
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import NewPassword from "./pages/NewPassword";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import BlogPage from "./pages/Blog";
import SinglePost from "./pages/SinglePost";
import Contact from "./pages/Contact";
import Kids from "./pages/Kids";
import LegalMentions from "./pages/LegalMentions";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import Error404 from "./pages/Error404";
import AdminDashboard from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminProductDetail from "./pages/AdminProductDetail";
import AdminQuotes from "./pages/AdminQuotes";
import AdminRelations from "./pages/AdminRelations";
import AdminPromotions from "./pages/AdminPromotions";

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
          <Route path="/admin/commandes" element={<AdminOrders />} />
          <Route path="/admin/commandes/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/produits" element={<AdminProducts />} />
          <Route path="/admin/produits/:id" element={<AdminProductDetail />} />
          <Route path="/admin/devis" element={<AdminQuotes />} />
          <Route path="/admin/clients" element={<AdminRelations key="clients" section="clients" />} />
          <Route path="/admin/messages" element={<AdminRelations key="messages" section="messages" />} />
          <Route path="/admin/avis" element={<AdminRelations key="avis" section="avis" />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />

          {/* Layout parent qui englobe toutes les pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/catalogue" element={<Store />} />
            <Route path="/enfants" element={<Kids />} />
            <Route path="/mentions-legales" element={<LegalMentions />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/commande" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<SinglePost />} />
            <Route path="/success/:orderId" element={<Success />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>

      </Router>
    </Provider>
  </HelmetProvider>
);