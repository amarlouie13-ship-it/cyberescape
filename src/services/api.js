import axios from 'axios';
import { supabase } from './supabase';

const defaultBaseURL = '/api';

function getLocalApiBaseURL() {
  return 'http://localhost:4000/api';
}

function normalizeApiBaseURL(value) {
  const input = String(value ?? '').trim().replace(/\/+$/, '');
  if (!input) {
    return defaultBaseURL;
  }

  return input.endsWith('/api') ? input : `${input}/api`;
}

function resolveApiBaseURL() {
  const configured = normalizeApiBaseURL(import.meta.env.VITE_API_BASE_URL);

  if (typeof window !== 'undefined') {
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.host)
      || /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

    if (isLocalhost) {
      return configured !== defaultBaseURL ? configured : defaultBaseURL;
    }
  }

  if (configured !== defaultBaseURL) {
    return configured;
  }

  return defaultBaseURL;
}

const configuredBaseURL = resolveApiBaseURL();
const TOKEN_REFRESH_SKEW_SECONDS = 60;

function decodeJwtPayload(token) {
  const parts = String(token ?? '').split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function shouldRefreshToken(token) {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp)) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return exp <= now + TOKEN_REFRESH_SKEW_SECONDS;
}

export const api = axios.create({
  baseURL: configuredBaseURL || defaultBaseURL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};
  config.headers['X-Request-Id'] =
    config.headers['X-Request-Id'] || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  if (config.headers.Authorization) {
    return config;
  }

  if (!supabase) {
    return config;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token ?? null;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const responseCode = error?.response?.data?.code || '';

    if (
      originalRequest &&
      !originalRequest._retry &&
      error?.response?.status === 401 &&
      ['token_validation_failed', 'auth_exception', 'missing_bearer_or_config'].includes(responseCode) &&
      supabase
    ) {
      originalRequest._retry = true;

      const { data } = await supabase.auth.refreshSession();
      const accessToken = data?.session?.access_token;

      if (accessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      }
    }

    if (
      originalRequest &&
      !originalRequest._retry &&
      error?.message === 'Network Error' &&
      configuredBaseURL === defaultBaseURL &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = `${window.location.protocol}//${window.location.hostname}:4001/api`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);
