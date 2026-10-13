import { createAction, createSelector, createSlice } from "@reduxjs/toolkit";
import {
  CART_EXTENSION_NAMESPACE,
  initializeCartThunk,
  emptyCartThunk,
  addProductToCart,
  deleteProductFromCart,
  substractProductFromCart,
  updateCartItemQuantityThunk,
  applyCouponThunk,
  removeCouponThunk,
  selectShippingRateThunk,
  toggleGiftWrapThunk,
} from "../thunkActionsCreator/cartThunks";
import { createOptimisticHandlers } from "../utils/optimisticFactory";

const { takeSnapshot, onFulfilled, onRejected } = createOptimisticHandlers({
  keys: [
    "items",
    "coupons",
    "fees",
    "totals",
    "shipping_rates",
    "needs_shipping",
    "cross_sells",
    "extensions",
    "nonce",
  ],
  onFulfilledPayload: (_state, payload) => {
    if (payload?.nonce) {
      localStorage.setItem("wc_cart_nonce", payload.nonce);
    }
  },
});

const startMutation = (state) => {
  state.loading = true;
  state.error = null;
  takeSnapshot(state);
};

const findItem = (state, itemKey) =>
  state.items.find((item) => item.key === itemKey);

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    coupons: [],
    fees: [],
    totals: null,
    shipping_rates: [],
    needs_shipping: false,
    cross_sells: [],
    extensions: {},
    nonce:
      typeof window !== "undefined"
        ? localStorage.getItem("wc_cart_nonce")
        : null,
    _snapshot: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeCartThunk.fulfilled, onFulfilled)
      .addCase(initializeCartThunk.rejected, onRejected)
      .addCase(addProductToCart.pending, (state, action) => {
        startMutation(state);
        const { productId, quantity } = action.meta.arg;
        const existing = state.items.find((i) => i.id === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.items.push({
            id: productId,
            key: `_optimistic_${productId}_${Date.now()}`,
            quantity,
            name: "…",
            images: [],
            prices: null,
            totals: null,
            _optimistic: true,
          });
        }
      })
      .addCase(addProductToCart.fulfilled, onFulfilled)
      .addCase(addProductToCart.rejected, onRejected)
      .addCase(deleteProductFromCart.pending, (state, action) => {
        startMutation(state);
        const { itemKey } = action.meta.arg;
        state.items = state.items.filter((i) => i.key !== itemKey);
      })
      .addCase(deleteProductFromCart.fulfilled, onFulfilled)
      .addCase(deleteProductFromCart.rejected, onRejected)
      .addCase(substractProductFromCart.pending, (state, action) => {
        startMutation(state);
        const { itemKey, quantity } = action.meta.arg;
        const newQuantity = quantity - 1;
        if (newQuantity <= 0) {
          state.items = state.items.filter((i) => i.key !== itemKey);
        } else {
          const item = findItem(state, itemKey);
          if (item) item.quantity = newQuantity;
        }
      })
      .addCase(substractProductFromCart.fulfilled, onFulfilled)
      .addCase(substractProductFromCart.rejected, onRejected)
      .addCase(updateCartItemQuantityThunk.pending, (state, action) => {
        startMutation(state);
        const { itemKey, quantity } = action.meta.arg;
        const item = findItem(state, itemKey);
        if (item) item.quantity = quantity;
      })
      .addCase(updateCartItemQuantityThunk.fulfilled, onFulfilled)
      .addCase(updateCartItemQuantityThunk.rejected, onRejected)
      .addCase(emptyCartThunk.pending, (state) => {
        startMutation(state);
        state.items = [];
        state.totals = null;
      })
      .addCase(emptyCartThunk.fulfilled, onFulfilled)
      .addCase(emptyCartThunk.rejected, onRejected)
      .addCase(applyCouponThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCouponThunk.fulfilled, onFulfilled)
      .addCase(applyCouponThunk.rejected, onRejected)
      .addCase(removeCouponThunk.pending, (state, action) => {
        startMutation(state);
        const { code } = action.meta.arg;
        state.coupons = state.coupons.filter((c) => c.code !== code);
      })
      .addCase(removeCouponThunk.fulfilled, onFulfilled)
      .addCase(removeCouponThunk.rejected, onRejected)
      .addCase(selectShippingRateThunk.pending, (state, action) => {
        startMutation(state);
        const { packageId, rateId } = action.meta.arg;
        const shippingPackage = state.shipping_rates.find(
          (pkg) => pkg.package_id === packageId,
        );
        shippingPackage?.shipping_rates.forEach((rate) => {
          rate.selected = rate.rate_id === rateId;
        });
      })
      .addCase(selectShippingRateThunk.fulfilled, onFulfilled)
      .addCase(selectShippingRateThunk.rejected, onRejected)
      .addCase(toggleGiftWrapThunk.pending, (state, action) => {
        startMutation(state);
        const { itemKey, giftWrap } = action.meta.arg;
        const extension =
          findItem(state, itemKey)?.extensions?.[CART_EXTENSION_NAMESPACE];
        if (extension) extension.gift_wrap = giftWrap;
      })
      .addCase(toggleGiftWrapThunk.fulfilled, onFulfilled)
      .addCase(toggleGiftWrapThunk.rejected, onRejected);
  },
});

export const cartActions = cartSlice.actions;

// Demande de remise au panier d'articles retirés (bouton « Annuler » d'un
// toast) ; traitée par store/cartRestoreListener.
export const cartItemsRestoreRequested = createAction(
  "cart/itemsRestoreRequested",
);

// Décrit un article du panier sous la forme attendue par addProductToCart.
export const toRestorableCartItem = (item) => ({
  productId: item.id,
  quantity: item.quantity,
  variation: Object.fromEntries(
    (item.variation ?? []).map(({ raw_attribute, attribute, value }) => [
      raw_attribute || attribute,
      value,
    ]),
  ),
});

export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + (Number(item.quantity) || 0), 0),
);

export const selectGiftWrapPrice = (state) =>
  state.cart.extensions?.[CART_EXTENSION_NAMESPACE]?.gift_wrap_price ?? null;

const sumAmounts = (...amounts) =>
  amounts.reduce((sum, amount) => sum + (Number(amount) || 0), 0);

/*
 * Récapitulatif chiffré du panier, en unités mineures et TTC : la Store API
 * fournit chaque montant hors taxes accompagné de sa TVA, que l'on additionne
 * comme le fait le bloc Panier de WooCommerce pour une boutique grand public.
 */
export const selectCartSummary = createSelector(
  [
    (state) => state.cart.totals,
    (state) => state.cart.fees,
    (state) => state.cart.coupons,
    (state) => state.cart.shipping_rates,
    (state) => state.cart.needs_shipping,
    selectCartItemCount,
  ],
  (totals, fees, coupons, shippingPackages, needsShipping, itemCount) => {
    if (!totals) return null;

    const selectedRates = shippingPackages.flatMap((pkg) =>
      pkg.shipping_rates.filter((rate) => rate.selected),
    );

    return {
      currency: totals,
      itemCount,
      subtotal: sumAmounts(totals.total_items, totals.total_items_tax),
      fees: fees.map((fee) => ({
        key: fee.key,
        name: fee.name,
        amount: sumAmounts(fee.totals.total, fee.totals.total_tax),
      })),
      discounts: coupons.map((coupon) => ({
        code: coupon.code,
        amount: sumAmounts(
          coupon.totals.total_discount,
          coupon.totals.total_discount_tax,
        ),
      })),
      shipping: needsShipping
        ? {
            label:
              selectedRates.length === 1 ? selectedRates[0].name : "Livraison",
            amount: selectedRates.length
              ? sumAmounts(totals.total_shipping, totals.total_shipping_tax)
              : null,
          }
        : null,
      total: Number(totals.total_price),
    };
  },
);
