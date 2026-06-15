import { useState, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { assetsApi, licensesApi } from "../services/api";
import { LoadingSpinner, ErrorMsg } from "../components/ui/index";

// ── Paleta USAC ─────────────────────────────────────────────────────────────
// Tomada del login: usac-700 ≈ #1e3a5f, usac-800 ≈ #162d4a, usac-200 ≈ #bfcfe0

function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3l7 3v5c0 4.418-3.134 8.418-7 10-3.866-1.582-7-5.582-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8L15 10" />
    </svg>
  );
}

// ── Badge estado ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  active:   { label: "Disponible",  cls: "bg-emerald-100 text-emerald-800" },
  inactive: { label: "No disponible", cls: "bg-slate-100 text-slate-500" },
  in_maintenance: { label: "En mantenimiento", cls: "bg-amber-100 text-amber-700" },
  retired:  { label: "Retirado",    cls: "bg-red-100 text-red-600" },
  expired:  { label: "Expirada",    cls: "bg-red-100 text-red-600" },
  cancelled:{ label: "Cancelada",   cls: "bg-slate-100 text-slate-500" },
};

function StatusBadge({ value }) {
  const { label, cls } = STATUS_MAP[value] || { label: value, cls: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Tabla reutilizable ────────────────────────────────────────────────────────
function DataTable({ columns, rows, emptyMsg }) {
  if (!rows.length) {
    return (
      <div className="py-14 text-center text-slate-400 text-sm">
        <svg className="w-9 h-9 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
        </svg>
        {emptyMsg}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-slate-700">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ConsultasPage({ onBack }) {
  const { data: assets, loading: loadingA, error: errorA, refetch: refetchA } = useApi(assetsApi.getAll);
  const { data: licenses, loading: loadingL, error: errorL, refetch: refetchL } = useApi(licensesApi.getAll);

  const [tab, setTab] = useState("assets"); // "assets" | "licenses"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Datos filtrados ──────────────────────────────────────────────────────
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter((a) => {
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || [a.assetName, a.assetType, a.model, a.location]
        .some((v) => v?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [assets, search, statusFilter]);

  const filteredLicenses = useMemo(() => {
    if (!licenses) return [];
    return licenses.filter((l) => {
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || l.softwareName?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [licenses, search, statusFilter]);

  // ── Contadores para tabs ─────────────────────────────────────────────────
  const availableAssets   = (assets   || []).filter((a) => a.status === "active").length;
  const availableLicenses = (licenses || []).filter((l) => l.status === "active").length;

  // ── Columnas ─────────────────────────────────────────────────────────────
  const assetCols = [
    { key: "assetName",  label: "Nombre" },
    { key: "assetType",  label: "Tipo" },
    { key: "model",      label: "Modelo" },
    { key: "location",   label: "Ubicación" },
    { key: "status",     label: "Estado",     render: (v) => <StatusBadge value={v} /> },
  ];

  const licenseCols = [
    { key: "softwareName",   label: "Software" },
    { key: "expirationDate", label: "Vence el", render: (v) => v || "Sin fecha" },
    { key: "status",         label: "Estado",   render: (v) => <StatusBadge value={v} /> },
  ];

  const loading = loadingA || loadingL;

  // ── Status options según tab ─────────────────────────────────────────────
  const statusOptions = tab === "assets"
    ? [["all","Todos"], ["active","Disponible"], ["in_maintenance","En mantenimiento"], ["inactive","No disponible"], ["retired","Retirado"]]
    : [["all","Todos"], ["active","Activa"], ["expired","Expirada"], ["cancelled","Cancelada"]];

  // reset filtro al cambiar de tab
  function handleTabChange(t) {
    setTab(t);
    setStatusFilter("all");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Header institucional ── */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <ShieldIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-widest leading-none mb-0.5">
                USAC · ECYS
              </p>
              <p className="text-sm font-semibold leading-none">
                Consulta pública — ITAM
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </header>

      {/* ── Cuerpo ── */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Título + descripción */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inventario disponible</h1>
            <p className="text-sm text-slate-500 mt-1">
              Consulta los activos de TI y licencias de software disponibles en la Escuela de Ciencias y Sistemas.
              No se requiere inicio de sesión.
            </p>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{availableAssets}</p>
                <p className="text-xs text-slate-500">Activos disponibles</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{availableLicenses}</p>
                <p className="text-xs text-slate-500">Licencias activas</p>
              </div>
            </div>
          </div>

          {/* Panel principal */}
          <div className="bg-white rounded-xl border border-slate-200">

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {[
                ["assets",   "Activos de TI",      assets?.length   ?? 0],
                ["licenses", "Licencias de software", licenses?.length ?? 0],
              ].map(([key, label, count]) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors
                    ${tab === key
                      ? "border-[#1e3a5f] text-[#1e3a5f]"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${tab === key ? "bg-[#1e3a5f]/10 text-[#1e3a5f]" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filtros */}
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                </svg>
                <input
                  type="text"
                  placeholder={tab === "assets" ? "Buscar por nombre, tipo, modelo…" : "Buscar software…"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]
                    w-64 transition-colors"
                />
              </div>

              {/* Filtro estado */}
              <div className="flex flex-wrap gap-1">
                {statusOptions.map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setStatusFilter(v)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                      ${statusFilter === v
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Contador de resultados */}
              <span className="ml-auto text-xs text-slate-400">
                {tab === "assets"
                  ? `${filteredAssets.length} resultado${filteredAssets.length !== 1 ? "s" : ""}`
                  : `${filteredLicenses.length} resultado${filteredLicenses.length !== 1 ? "s" : ""}`
                }
              </span>
            </div>

            {/* Contenido */}
            {loading ? (
              <LoadingSpinner />
            ) : tab === "assets" ? (
              errorA ? (
                <ErrorMsg message="No se pudieron cargar los activos." onRetry={refetchA} />
              ) : (
                <DataTable
                  columns={assetCols}
                  rows={filteredAssets}
                  emptyMsg="No hay activos que coincidan con los filtros."
                />
              )
            ) : (
              errorL ? (
                <ErrorMsg message="No se pudieron cargar las licencias." onRetry={refetchL} />
              ) : (
                <DataTable
                  columns={licenseCols}
                  rows={filteredLicenses}
                  emptyMsg="No hay licencias que coincidan con los filtros."
                />
              )
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} Escuela de Ciencias y Sistemas — Universidad de San Carlos de Guatemala
      </footer>
    </div>
  );
}
