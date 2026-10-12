import { createListenerMiddleware } from "@reduxjs/toolkit";
import { cartItemsRestoreRequested } from "../slices/cartSlice";
import { showToast } from "../slices/toastSlice";
import { addProductToCart } from "../thunkActionsCreator/cartThunks";

// Le bouton « Annuler » d'un toast ne transporte qu'une action sérialisable :
// ce listener la traduit en ajouts au panier. Les articles repartent un par un,
// la session WooCommerce n'étant pas verrouillée entre requêtes concurrentes.
export const cartRestoreListener = createListenerMiddleware();

cartRestoreListener.startListening({
  actionCreator: cartItemsRestoreRequested,
  effect: async ({ payload: items }, listenerApi) => {
    for (const item of items) {
      const result = await listenerApi.dispatch(addProductToCart(item));
      if (addProductToCart.rejected.match(result)) {
        listenerApi.dispatch(showToast(result.payload));
        return;
      }
    }
  },
});
