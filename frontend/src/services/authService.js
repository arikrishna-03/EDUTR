import api from "../api/axiosConfig";

export async function login(email, password) {
  // expected backend: POST /auth/login -> { token, user }
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function register(payload) {
  // expected backend: POST /auth/register
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function me() {
  const res = await api.get("/auth/me");
  return res.data;
}

export function setToken(token) {
  localStorage.setItem("edu_token", token);
}

export function logout() {
  localStorage.removeItem("edu_token");
}
