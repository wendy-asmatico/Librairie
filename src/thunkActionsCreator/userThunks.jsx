import { createAsyncThunk } from "@reduxjs/toolkit";

async function requestAuthJson(url, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      "Impossible de joindre WordPress. Vérifiez que WAMP est démarré et que l’URL API est correcte.",
    );
  }

  const body = await response.text();
  let data = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error(
        `WordPress a renvoyé une réponse invalide (HTTP ${response.status}). Vérifiez les journaux PHP et l’URL API.`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `${fallbackMessage} (HTTP ${response.status}).`);
  }
  if (!data) {
    throw new Error(
      `WordPress a renvoyé une réponse vide (HTTP ${response.status}). Vérifiez l’endpoint REST.`,
    );
  }

  return data;
}

export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ username, password, remember = true }, thunkAPI) => {
    try {
      const data = await requestAuthJson(
        `${import.meta.env.VITE_API_URL}/wp-json/jwt-auth/v1/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
        "Identifiants incorrects.",
      );
      thunkAPI.dispatch(fetchCurrentCustomerThunk(data.token));
      thunkAPI.dispatch(fetchCurrentUserOrdersThunk(data.token));
      return {
        token: data.token,
        remember,
        profile: {
          email: data.user_email,
          displayName: data.user_display_name,
          nicename: data.user_nicename,
        },
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchCurrentUserThunk = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wp/v2/users/me?context=edit`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de recuperer le profil.");
      }
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        displayName: data.name,
        roles: data.roles,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateCurrentUserThunk = createAsyncThunk(
  "user/updateCurrentUser",
  async ({ email, firstName, lastName, password }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;
      const body = {};
      if (email !== undefined) body.email = email;
      if (firstName !== undefined) body.first_name = firstName;
      if (lastName !== undefined) body.last_name = lastName;
      if (password !== undefined) body.password = password;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wp/v2/users/me`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de mettre a jour le profil.");
      }
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        displayName: data.name,
        roles: data.roles,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchCurrentCustomerThunk = createAsyncThunk(
  "user/fetchCurrentCustomer",
  async (tokenArg, thunkAPI) => {
    try {
      const token = tokenArg || thunkAPI.getState().user.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de recuperer les infos client.",
        );
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchCurrentUserOrdersThunk = createAsyncThunk(
  "user/fetchCurrentUserOrders",
  async (tokenArg, thunkAPI) => {
    try {
      const token = tokenArg || thunkAPI.getState().user.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de recuperer les commandes.",
        );
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const registerThunk = createAsyncThunk(
  "user/register",
  async ({ username, email, password, ...details }, thunkAPI) => {
    try {
      // Endpoint custom a exposer cote WordPress (mu-plugin), au meme titre
      // que le CORS : WordPress ne permet pas la creation de compte anonyme
      // via son API par defaut. On attend en reponse un token, comme pour le
      // login, pour eviter un deuxieme aller-retour reseau.
      const data = await requestAuthJson(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // details : prénom, nom, civilité, newsletter (page Inscription)
          body: JSON.stringify({ username, email, password, ...details }),
        },
        "Impossible de créer le compte.",
      );
      thunkAPI.dispatch(fetchCurrentCustomerThunk(data.token));
      thunkAPI.dispatch(fetchCurrentUserOrdersThunk(data.token));
      return {
        token: data.token,
        profile: {
          email: data.user_email,
          displayName: data.user_display_name,
          nicename: data.user_nicename,
        },
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const updateCurrentCustomerThunk = createAsyncThunk(
  "user/updateCurrentCustomer",
  async (customerData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/customer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible de mettre à jour les informations client.",
        );
      }

      // L'API renvoie directement l'objet client complet mis à jour
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const deleteCurrentUserThunk = createAsyncThunk(
  "user/deleteCurrentUser",
  async ({ password }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user.token;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/user`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Impossible de supprimer le compte.");
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
