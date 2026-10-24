import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Requête : ajouter automatiquement le JWT
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    const isPublicGet =
      method === "get" &&
      (url === "espaces/" ||
        url.startsWith("espaces/") ||
        url === "types-evenements/" ||
        url.startsWith("types-evenements/"));

    /*
     * Ne pas ajouter le token aux routes publiques.
     */
    if (token && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| Réponse : renouveler automatiquement le access token
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

/*
|--------------------------------------------------------------------------
| Intercepteur de réponse
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
     * Si ce n'est pas une erreur 401,
     * on laisse Axios gérer normalement.
     */
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    /*
     * Ne jamais essayer de rafraîchir le token
     * sur les routes d'authentification elles-mêmes.
     */
    if (
      originalRequest?.url?.includes("auth/login/") ||
      originalRequest?.url?.includes("auth/refresh/")
    ) {
      logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");

    /*
     * Aucun refresh token disponible.
     */
    if (!refreshToken) {
      logout();
      window.location.href = "/login";

      return Promise.reject(error);
    }

    /*
     * Si un rafraîchissement est déjà en cours,
     * on attend le nouveau token.
     */
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(`${API_URL}auth/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;

      localStorage.setItem("access_token", newAccessToken);

      isRefreshing = false;

      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      logout();

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  },
);

/*
|--------------------------------------------------------------------------
| ESPACES
|--------------------------------------------------------------------------
*/

export const espaceService = {
  getAll: () => api.get("espaces/"),

  getById: (id) => api.get(`espaces/${id}/`),

  create: (data) => api.post("espaces/", data),

  update: (id, data) => api.put(`espaces/${id}/`, data),

  delete: (id) => api.delete(`espaces/${id}/`),
};

/*
|--------------------------------------------------------------------------
| RÉSERVATIONS
|--------------------------------------------------------------------------
*/

export const reservationService = {
  getAll: () => api.get("reservations/"),

  getById: (id) => api.get(`reservations/${id}/`),

  create: (data) => api.post("reservations/", data),

  update: (id, data) => api.put(`reservations/${id}/`, data),

  delete: (id) => api.delete(`reservations/${id}/`),
};

/*
|--------------------------------------------------------------------------
| TYPES D'ÉVÉNEMENTS
|--------------------------------------------------------------------------
*/

export const typeEvenementService = {
  getAll: () => api.get("types-evenements/"),

  getById: (id) => api.get(`types-evenements/${id}/`),

  create: (data) => api.post("types-evenements/", data),

  update: (id, data) => api.put(`types-evenements/${id}/`, data),

  delete: (id) => api.delete(`types-evenements/${id}/`),
};

/*
|--------------------------------------------------------------------------
| UTILISATEURS / CLIENTS
|--------------------------------------------------------------------------
*/

export const utilisateurService = {
  getAll: () => api.get("utilisateurs/"),

  getById: (id) => api.get(`utilisateurs/${id}/`),

  create: (data) => api.post("utilisateurs/", data),

  update: (id, data) => api.put(`utilisateurs/${id}/`, data),

  delete: (id) => api.delete(`utilisateurs/${id}/`),
};

/*
|--------------------------------------------------------------------------
| PAIEMENTS
|--------------------------------------------------------------------------
*/

export const paiementService = {
  getAll: () => api.get("paiements/"),

  getById: (id) => api.get(`paiements/${id}/`),

  create: (data) => api.post("paiements/", data),

  update: (id, data) => api.put(`paiements/${id}/`, data),

  delete: (id) => api.delete(`paiements/${id}/`),

  confirmer: (id) => api.post(`paiements/${id}/confirmer_paiement/`),
};

/*
|--------------------------------------------------------------------------
| AUTHENTIFICATION
|--------------------------------------------------------------------------
*/

export const authService = {
  login: (credentials) => api.post("auth/login/", credentials),

  refresh: (refreshToken) =>
    api.post("auth/refresh/", {
      refresh: refreshToken,
    }),

  register: (userData) => api.post("utilisateurs/", userData),
};

export const clientService = {
  getAll: () => api.get("clients/"),

  getById: (id) => api.get(`clients/${id}/`),

  create: (data) => api.post("clients/", data),

  update: (id, data) => api.put(`clients/${id}/`, data),

  delete: (id) => api.delete(`clients/${id}/`),
};

export default api;
