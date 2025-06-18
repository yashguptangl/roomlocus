import axios from "axios";
import Router from "next/router"; // Next.js ke liye

const api = axios.create({
  baseURL: "/api",
  // ...other config
});

// Axios response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const role = localStorage.getItem("role"); // "user", "owner", "agent"
      if (role === "user") {
        Router.replace("/user/login");
      } else if (role === "owner") {
        Router.replace("/owner/login");
      } else if (role === "agent") {
        Router.replace("/agent/login");
      } else {
        Router.replace("/");
      }
    }
    return Promise.reject(error);
  }
);

export default api;