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

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const baseUrl = import.meta.env.BASE_URL || "/";
      const loginPath = `${baseUrl}login`.replace(/\/+/g, "/");

      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  },
);
