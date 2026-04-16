import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cga_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cga_token");
      localStorage.removeItem("cga_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Simulations
export const simAPI = {
  getAll: (params) => api.get("/simulations", { params }),
  getOne: (id) => api.get(`/simulations/${id}`),
  submit: (id, data) => api.post(`/simulations/${id}/submit`, data),
  getLevelProgress: () => api.get("/simulations/level-progress"),
};

// Progress
export const progressAPI = {
  getUserProgress: () => api.get("/progress"),
  getSimProgress: (simId) => api.get(`/progress/${simId}`),
};

// News
export const newsAPI = {
  getNews: (params) => api.get("/news", { params }),
};

// Leaderboard
export const leaderboardAPI = {
  get: (params) => api.get("/leaderboard", { params }),
};

export default api;
