import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:12046/api/v1",
});

api.interceptors.request.use((config) => {
  // Don't attach auth header for login requests
  const isLoginRequest = config.url?.includes("/auth/login");
  const token = localStorage.getItem("token");
  if (!isLoginRequest && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    // Avoid forcing a full-page redirect for 401s coming from the login endpoint
    const isLoginRequest = err.config?.url?.includes("/auth/login");
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);


export default api;
