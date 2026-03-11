const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const headers = () => {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const req = async (url: string, opts: RequestInit = {}) => {
  const res = await fetch(`${BASE}${url}`, { ...opts, headers: headers() });
  return res.json();
};

export const api = {
  get:    (url: string)               => req(url),
  post:   (url: string, body: unknown) => req(url, { method: "POST",   body: JSON.stringify(body) }),
  put:    (url: string, body: unknown) => req(url, { method: "PUT",    body: JSON.stringify(body) }),
  delete: (url: string)               => req(url, { method: "DELETE" }),
};

export const API_BASE = BASE;
export default api;
