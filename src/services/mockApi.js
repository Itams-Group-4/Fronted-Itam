/**
 * mockApi.js
 * ──────────────────────────────────────────────────────────────────────────
 * Simula TODOS los endpoints del backend usando los CSV de public/data/.
 * Los datos se cargan una vez y se mantienen en memoria durante la sesión,
 * por lo que CREATE / UPDATE / DELETE funcionan pero NO persisten al recargar.
 *
 * La firma de cada método es idéntica a la de api.js para que el switch
 * en el modo mock sea completamente transparente al resto del código.
 * ──────────────────────────────────────────────────────────────────────────
 */

import {
  parseUsers,
  parseAssets,
  parseLicenses,
  parseMaintenance,
  parseAssignments,
  clearCaches,
} from "./csvService";

// ── Caché en memoria ──────────────────────────────────────────────────────────
// Cada store se carga de forma lazy la primera vez que se necesita.
const store = {
  users: null,
  assets: null,
  licenses: null,
  maintenance: null,
  assignments: null,
};

async function getStore(key, loaderFn) {
  if (!store[key]) store[key] = await loaderFn();
  return store[key];
}

// Genera el siguiente id para una colección
function nextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map((item) => item.id ?? 0)) + 1;
}

// Delay artificial para simular latencia de red (~120 ms)
const delay = () => new Promise((r) => setTimeout(r, 120));

// ── Autenticación mock ────────────────────────────────────────────────────────
// Contraseña aceptada para todos los usuarios en modo mock (no verifica bcrypt)
const MOCK_PASSWORD = "password123";

export const mockAuthApi = {
  login: async ({ email, password }) => {
    await delay();
    const users = await getStore("users", parseUsers);
    const user = users.find((u) => u.email === email);

    if (!user) throw new Error("Correo o contraseña incorrectos");
    // En modo mock aceptamos cualquier contraseña que no esté vacía,
    // o la contraseña predefinida, para facilitar las pruebas.
    if (password !== MOCK_PASSWORD && password !== "") {
      throw new Error("Correo o contraseña incorrectos");
    }
    // Devuelve el mismo formato que el backend real
    const { ...safeUser } = user;
    return safeUser;
  },
};

// ── Helper CRUD genérico ──────────────────────────────────────────────────────
function makeCrud(storeKey, loaderFn) {
  return {
    getAll: async () => {
      await delay();
      return [...(await getStore(storeKey, loaderFn))];
    },

    getById: async (id) => {
      await delay();
      const list = await getStore(storeKey, loaderFn);
      const item = list.find((i) => i.id === Number(id));
      if (!item) throw new Error(`${storeKey} #${id} no encontrado`);
      return { ...item };
    },

    create: async (data) => {
      await delay();
      const list = await getStore(storeKey, loaderFn);
      const newItem = { ...data, id: nextId(list) };
      list.push(newItem);
      clearCaches(); // invalida lookups relacionales
      return { ...newItem };
    },

    update: async (id, data) => {
      await delay();
      const list = await getStore(storeKey, loaderFn);
      const idx = list.findIndex((i) => i.id === Number(id));
      if (idx === -1) throw new Error(`${storeKey} #${id} no encontrado`);
      list[idx] = { ...list[idx], ...data, id: Number(id) };
      clearCaches();
      return { ...list[idx] };
    },

    delete: async (id) => {
      await delay();
      const list = await getStore(storeKey, loaderFn);
      const idx = list.findIndex((i) => i.id === Number(id));
      if (idx === -1) throw new Error(`${storeKey} #${id} no encontrado`);
      list.splice(idx, 1);
      clearCaches();
      return null;
    },
  };
}

// ── APIs individuales ─────────────────────────────────────────────────────────
export const mockUsersApi       = makeCrud("users",       parseUsers);
export const mockAssetsApi      = makeCrud("assets",      parseAssets);
export const mockLicensesApi    = makeCrud("licenses",    parseLicenses);
export const mockMaintenanceApi = makeCrud("maintenance", parseMaintenance);
export const mockAssignmentsApi = makeCrud("assignments", parseAssignments);

export const mockHealthApi = {
  check: async () => {
    await delay();
    return { status: "ok", mode: "mock" };
  },
};
