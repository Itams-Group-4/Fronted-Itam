/**
 * api.js
 * ──────────────────────────────────────────────────────────────────────────
 * Punto único de acceso a los datos.
 *
 * MODO REAL  → llama al backend Spring Boot en localhost:8080
 * MODO MOCK  → usa los CSV de public/data/ a través de mockApi.js
 *
 * Para cambiar de modo edita el archivo .env (o .env.local):
 *
 *   VITE_MOCK_MODE=true    →  mock  (CSV, sin backend)
 *   VITE_MOCK_MODE=false   →  real  (Spring Boot)
 *
 * El resto del código importa SIEMPRE desde este archivo y nunca
 * accede directamente a mockApi.js ni a csvService.js.
 * ──────────────────────────────────────────────────────────────────────────
 */

import {
  mockAuthApi,
  mockUsersApi,
  mockAssetsApi,
  mockLicensesApi,
  mockMaintenanceApi,
  mockAssignmentsApi,
  mockHealthApi,
} from "./mockApi";

// ── Detección de modo ─────────────────────────────────────────────────────────
export const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "false";

// ── Backend real ──────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const realAuthApi = {
  login: async (credentials) => {
    const response = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      localStorage.setItem("token", response.token);
    }

    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  me: () => request("/api/auth/me"),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
const realUsersApi = {
  getAll: () => request("/api/usuarios"),
  getById: (id) => request(`/api/usuarios/${id}`),
  create: (data) =>
    request("/api/usuarios", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/api/usuarios/${id}`, { method: "DELETE" }),
};

// ── Assets ────────────────────────────────────────────────────────────────────
const realAssetsApi = {
  getAll: () => request("/api/assets"),
  getById: (id) => request(`/api/assets/${id}`),
  create: (data) =>
    request("/api/assets", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/api/assets/${id}`, { method: "DELETE" }),
};

// ── Licenses ──────────────────────────────────────────────────────────────────
const realLicensesApi = {
  getAll: () => request("/api/licencias"),
  getById: (id) => request(`/api/licencias/${id}`),
  create: (data) =>
    request("/api/licencias", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/licencias/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/api/licencias/${id}`, { method: "DELETE" }),
};

// ── Maintenance ───────────────────────────────────────────────────────────────
const realMaintenanceApi = {
  getAll: () => request("/api/maintenance"),
  getById: (id) => request(`/api/maintenance/${id}`),
  create: (data) =>
    request("/api/maintenance", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/api/maintenance/${id}`, { method: "DELETE" }),
};

// ── Assignments ───────────────────────────────────────────────────────────────
const realAssignmentsApi = {
  getAll: () => request("/api/assignments"),
  getById: (id) => request(`/api/assignments/${id}`),
  create: (data) =>
    request("/api/assignments", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/api/assignments/${id}`, { method: "DELETE" }),
};

// ── Health ────────────────────────────────────────────────────────────────────
const realHealthApi = {
  check: () => request("/api/health"),
};

// ── Exportaciones (switch automático) ─────────────────────────────────────────
export const authApi = IS_MOCK ? mockAuthApi : realAuthApi;
export const usersApi = IS_MOCK ? mockUsersApi : realUsersApi;
export const assetsApi = IS_MOCK ? mockAssetsApi : realAssetsApi;
export const licensesApi = IS_MOCK ? mockLicensesApi : realLicensesApi;
export const maintenanceApi = IS_MOCK ? mockMaintenanceApi : realMaintenanceApi;
export const assignmentsApi = IS_MOCK ? mockAssignmentsApi : realAssignmentsApi;
export const healthApi = IS_MOCK ? mockHealthApi : realHealthApi;
