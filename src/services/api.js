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
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
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
  login: (credentials) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
const realUsersApi = {
  getAll:   ()         => request("/api/users"),
  getById:  (id)       => request(`/api/users/${id}`),
  create:   (data)     => request("/api/users",     { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/api/users/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:   (id)       => request(`/api/users/${id}`, { method: "DELETE" }),
};

// ── Assets ────────────────────────────────────────────────────────────────────
const realAssetsApi = {
  getAll:   ()         => request("/api/assets"),
  getById:  (id)       => request(`/api/assets/${id}`),
  create:   (data)     => request("/api/assets",      { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/api/assets/${id}`, { method: "PUT",   body: JSON.stringify(data) }),
  delete:   (id)       => request(`/api/assets/${id}`, { method: "DELETE" }),
};

// ── Licenses ──────────────────────────────────────────────────────────────────
const realLicensesApi = {
  getAll:   ()         => request("/api/licenses"),
  getById:  (id)       => request(`/api/licenses/${id}`),
  create:   (data)     => request("/api/licenses",      { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/api/licenses/${id}`, { method: "PUT",   body: JSON.stringify(data) }),
  delete:   (id)       => request(`/api/licenses/${id}`, { method: "DELETE" }),
};

// ── Maintenance ───────────────────────────────────────────────────────────────
const realMaintenanceApi = {
  getAll:   ()         => request("/api/maintenance"),
  getById:  (id)       => request(`/api/maintenance/${id}`),
  create:   (data)     => request("/api/maintenance",      { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/api/maintenance/${id}`, { method: "PUT",   body: JSON.stringify(data) }),
  delete:   (id)       => request(`/api/maintenance/${id}`, { method: "DELETE" }),
};

// ── Assignments ───────────────────────────────────────────────────────────────
const realAssignmentsApi = {
  getAll:   ()         => request("/api/assignments"),
  getById:  (id)       => request(`/api/assignments/${id}`),
  create:   (data)     => request("/api/assignments",      { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => request(`/api/assignments/${id}`, { method: "PUT",   body: JSON.stringify(data) }),
  delete:   (id)       => request(`/api/assignments/${id}`, { method: "DELETE" }),
};

// ── Health ────────────────────────────────────────────────────────────────────
const realHealthApi = {
  check: () => request("/api/health"),
};

// ── Exportaciones (switch automático) ─────────────────────────────────────────
export const authApi        = IS_MOCK ? mockAuthApi        : realAuthApi;
export const usersApi       = IS_MOCK ? mockUsersApi       : realUsersApi;
export const assetsApi      = IS_MOCK ? mockAssetsApi      : realAssetsApi;
export const licensesApi    = IS_MOCK ? mockLicensesApi    : realLicensesApi;
export const maintenanceApi = IS_MOCK ? mockMaintenanceApi : realMaintenanceApi;
export const assignmentsApi = IS_MOCK ? mockAssignmentsApi : realAssignmentsApi;
export const healthApi      = IS_MOCK ? mockHealthApi      : realHealthApi;
