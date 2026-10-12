import { createAsyncThunk } from "@reduxjs/toolkit";

const CART_URL = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/cart`;

// Espace de noms des extensions Store API déclarées dans mu-plugins/cart.php.
export const CART_EXTENSION_NAMESPACE = "headless-cart";

const buildCartHeaders = (thunkAPI, currentNonce) => {
  const token = thunkAPI.getState().user.token;
  return {
    "Content-Type": "application/json",
    ...(currentNonce && { Nonce: currentNonce }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Appelle une route d'écriture du panier et renvoie la réponse accompagnée du
// nonce, que WooCommerce peut renouveler à chaque échange.
const requestCart = async (
  thunkAPI,
  { path, method = "POST", body, fallbackMessage },
) => {
  const currentNonce = thunkAPI.getState().cart.nonce;
  if (!currentNonce) {
    throw new Error("Jeton de session manquant.");
  }

  const response = await fetch(`${CART_URL}${path}`, {
    method,
    headers: buildCartHeaders(thunkAPI, currentNonce),
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  const nonce = response.headers.get("Nonce");
  return { ...data, ...(nonce && { nonce }) };
};

// Fabrique un thunk de mutation : `buildRequest(arg)` décrit la requête, le
// thunk renvoie le panier à jour ou rejette avec un message affichable.
const createCartMutation = (type, buildRequest) =>
  createAsyncThunk(type, async (arg, thunkAPI) => {
    try {
      return await requestCart(thunkAPI, buildRequest(arg));
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  });

export const initializeCartThunk = createAsyncThunk(
  "cart/initialize",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const response = await fetch(CART_URL, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error("Impossible de récupérer le panier initial.");
      }
      const nonce = response.headers.get("Nonce");
      const cart = await response.json();
      return { ...cart, nonce };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const emptyCartThunk = createAsyncThunk(
  "cart/empty",
  async (_, thunkAPI) => {
    try {
      // DELETE /cart/items renvoie la liste (vide) des articles, pas le panier.
      const { nonce } = await requestCart(thunkAPI, {
        path: "/items",
        method: "DELETE",
        fallbackMessage: "Impossible de vider le panier.",
      });
      return { items: [], ...(nonce && { nonce }) };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const addProductToCart = createCartMutation(
  "cart/addProduct",
  ({ productId, quantity, variation = [] }) => ({
    path: "/add-item",
    body: {
      id: productId,
      quantity,
      variation: Object.entries(variation).map(([attribute, value]) => ({
        attribute,
        value,
      })),
    },
    fallbackMessage: "Impossible d'ajouter l'article au panier.",
  }),
);

export const deleteProductFromCart = createCartMutation(
  "cart/deleteProduct",
  ({ itemKey }) => ({
    path: "/remove-item",
    body: { key: itemKey },
    fallbackMessage: "Impossible de supprimer l'article du panier.",
  }),
);

export const substractProductFromCart = createCartMutation(
  "cart/substractProduct",
  ({ itemKey, quantity }) => {
    const newQuantity = quantity - 1;
    return {
      path: newQuantity > 0 ? "/update-item" : "/remove-item",
      body:
        newQuantity > 0
          ? { key: itemKey, quantity: newQuantity }
          : { key: itemKey },
      fallbackMessage: "Impossible de modifier l'article.",
    };
  },
);

export const updateCartItemQuantityThunk = createCartMutation(
  "cart/updateItemQuantity",
  ({ itemKey, quantity }) => ({
    path: "/update-item",
    body: { key: itemKey, quantity },
    fallbackMessage: "Impossible de modifier la quantité.",
  }),
);

export const applyCouponThunk = createCartMutation(
  "cart/applyCoupon",
  ({ code }) => ({
    path: "/apply-coupon",
    body: { code },
    fallbackMessage: "Ce code promo n'est pas valide.",
  }),
);

export const removeCouponThunk = createCartMutation(
  "cart/removeCoupon",
  ({ code }) => ({
    path: "/remove-coupon",
    body: { code },
    fallbackMessage: "Impossible de retirer ce code promo.",
  }),
);

export const selectShippingRateThunk = createCartMutation(
  "cart/selectShippingRate",
  ({ packageId, rateId }) => ({
    path: "/select-shipping-rate",
    body: { package_id: packageId, rate_id: rateId },
    fallbackMessage: "Impossible de choisir ce mode de livraison.",
  }),
);

export const toggleGiftWrapThunk = createCartMutation(
  "cart/toggleGiftWrap",
  ({ itemKey, giftWrap }) => ({
    path: "/extensions",
    body: {
      namespace: CART_EXTENSION_NAMESPACE,
      data: { key: itemKey, gift_wrap: giftWrap },
    },
    fallbackMessage: "Impossible de modifier l'emballage cadeau.",
  }),
);
