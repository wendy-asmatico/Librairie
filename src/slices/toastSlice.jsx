import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  message: null,
  action: null,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    // showToast("Message") ou showToast({ message, action }), où `action`
    // ajoute un bouton : { label, intent }, `intent` étant l'action Redux
    // (sérialisable) dispatchée au clic.
    showToast: {
      reducer: (_state, action) => ({ ...initialState, ...action.payload }),
      prepare: (toast) => ({
        payload: {
          id: nanoid(),
          ...(typeof toast === "string" ? { message: toast } : toast),
        },
      }),
    },
    hideToast: () => initialState,
  },
});

export const { showToast, hideToast } = toastSlice.actions;
