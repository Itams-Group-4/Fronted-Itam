import Papa from "papaparse";

// ── Lector base ───────────────────────────────────────────────────────────────
export async function loadCsv(fileName) {
  return new Promise((resolve, reject) => {
    Papa.parse(`/data/${fileName}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

// ── Normalización: CSV snake_case → formato que espera el frontend ─────────────
// Replica exactamente la forma de los DTOs del backend Spring Boot.

function num(v) {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function date(v) {
  return v && v.trim() !== "" ? v.trim() : null;
}

// Lookup rápido de usuarios por id (para adjuntar { id, name } en las relaciones)
let _usersCache = null;
async function getUsersMap() {
  if (_usersCache) return _usersCache;
  const rows = await loadCsv("users.csv");
  _usersCache = Object.fromEntries(rows.map((r) => [r.id, r]));
  return _usersCache;
}

// Lookup rápido de assets por id
let _assetsCache = null;
async function getAssetsMap() {
  if (_assetsCache) return _assetsCache;
  const rows = await loadCsv("asset.csv");
  _assetsCache = Object.fromEntries(rows.map((r) => [r.id, r]));
  return _assetsCache;
}

export function clearCaches() {
  _usersCache = null;
  _assetsCache = null;
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
export async function parseUsers() {
  const rows = await loadCsv("users.csv");
  return rows.map((r) => ({
    id: num(r.id),
    name: r.name,
    email: r.email,
    role: r.role,
    createdAt: date(r.created_at),
  }));
}

// ── Activos ───────────────────────────────────────────────────────────────────
export async function parseAssets() {
  const [rows, usersMap] = await Promise.all([loadCsv("asset.csv"), getUsersMap()]);
  return rows.map((r) => {
    const resp = usersMap[r.responsible_id];
    return {
      id: num(r.id),
      assetName: r.asset_name,
      assetType: r.asset_type,
      model: r.model,
      serialNumber: r.serial_number,
      location: r.location,
      status: r.status,
      acquisitionDate: date(r.acquisition_date),
      acquisitionValue: r.acquisition_value ? parseFloat(r.acquisition_value) : null,
      observations: r.observations || null,
      responsible: resp ? { id: num(resp.id), name: resp.name } : null,
    };
  });
}

// ── Licencias ─────────────────────────────────────────────────────────────────
export async function parseLicenses() {
  const [rows, usersMap] = await Promise.all([loadCsv("license.csv"), getUsersMap()]);
  return rows.map((r) => {
    const resp = usersMap[r.responsible_id];
    return {
      id: num(r.id),
      softwareName: r.software_name,
      licenseKey: r.license_key || null,
      expirationDate: date(r.expiration_date),
      status: r.status,
      assetId: r.asset_id ? num(r.asset_id) : null,
      responsible: resp ? { id: num(resp.id), name: resp.name } : null,
    };
  });
}

// ── Mantenimiento ─────────────────────────────────────────────────────────────
export async function parseMaintenance() {
  const [rows, usersMap, assetsMap] = await Promise.all([
    loadCsv("maintenance.csv"),
    getUsersMap(),
    getAssetsMap(),
  ]);
  return rows.map((r) => {
    const tech = usersMap[r.technician_id];
    const asset = assetsMap[r.asset_id];
    return {
      id: num(r.id),
      assetId: num(r.asset_id),
      assetName: asset ? asset.asset_name : null,
      scheduledDate: date(r.scheduled_date),
      type: r.type,
      status: r.status,
      description: r.description || null,
      technician: tech ? { id: num(tech.id), name: tech.name } : null,
    };
  });
}

// ── Asignaciones ──────────────────────────────────────────────────────────────
export async function parseAssignments() {
  const [rows, usersMap, assetsMap] = await Promise.all([
    loadCsv("asset_assignment.csv"),
    getUsersMap(),
    getAssetsMap(),
  ]);
  return rows.map((r) => {
    const u = usersMap[r.user_id];
    const a = assetsMap[r.asset_id];
    return {
      id: num(r.id),
      assetId: num(r.asset_id),
      assetName: a ? a.asset_name : null,
      user: u ? { id: num(u.id), name: u.name } : null,
      assignedDate: date(r.assigned_date),
      returnedDate: date(r.returned_date) || null,
      notes: r.notes || null,
    };
  });
}
