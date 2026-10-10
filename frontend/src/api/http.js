import axios from "axios";
import { appConfig } from "../config/appConfig";
import { clearSession, getToken } from "../auth/session";
import { normalizeApiError } from "./errors";

export const http = axios.create({
  baseURL: appConfig.apiUrl,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);
    const requestUrl = String(error?.config?.url || "");
    const authRequest = /\/(login|register|forgot-password|reset-password)$/.test(requestUrl);

    if (normalized.status === 401 && !authRequest && getToken()) {
      const role = localStorage.getItem("role") || "student";
      clearSession();
      const redirect = `${window.location.pathname}${window.location.search}`;
      const login = `/login?role=${encodeURIComponent(role)}&redirect=${encodeURIComponent(redirect)}`;
      window.dispatchEvent(new CustomEvent("waratel:auth-expired", { detail: { login } }));
    }

    return Promise.reject(normalized);
  }
);
