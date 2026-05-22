import axios from "axios";

const api = axios.create({
  baseURL: "https://hostel-finder-backend-xloj.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("userInfo");
  if (user) {
    const token = JSON.parse(user).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;