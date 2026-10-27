import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://pregnancy-care-finder.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    const sentWithToken = Boolean(error.config?.headers?.Authorization);

    if ((status === 401 || status === 403) && !isAuthEndpoint && sentWithToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.hash.startsWith("#/login")) {
        window.history.replaceState(null, "", "#/login");
        window.location.reload();
      }
    }

    return Promise.reject(error);
  },
);
