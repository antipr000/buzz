import axios from "axios";

import { getSupabase } from "@/lib/supabase";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Missing Supabase env or client — requests stay unauthenticated
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data ?? error.message);
    return Promise.reject(error);
  }
);
