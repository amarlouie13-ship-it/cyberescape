import axios from 'axios';
import { supabase } from './supabase';

const defaultBaseURL = '/api';
const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: configuredBaseURL || defaultBaseURL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (!supabase) {
    return config;
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
