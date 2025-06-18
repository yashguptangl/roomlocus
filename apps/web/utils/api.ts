import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});
if (typeof window !== "undefined") {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const role = localStorage.getItem("role");
        const currentPath = window.location.pathname;
        if (role === "owner" && currentPath !== "/owner/signin") {
          window.location.href = "/owner/signin";
        } else if (role === "user" && currentPath !== "/user/signin") {
          window.location.href = "/user/signin";
        } else if (role === "agent" && currentPath !== "/agent/signin") {
          window.location.href = "/agent/signin";
        } else {
          window.location.href = "/";
        }
      }  
      return Promise.reject(error);
    }
  );
}
export default api;