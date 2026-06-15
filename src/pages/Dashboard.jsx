import { useApi } from "../hooks/useApi";
import { assetsApi, licensesApi, maintenanceApi, assignmentsApi, usersApi } from "../services/api";
import { StatCard, Card, Badge, LoadingSpinner } from "../components/ui/index";

function RecentList({ title, items, columns, onViewAll, viewAllKey, onNavigate }) {
  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
        {onViewAll && (
          <button
            onClick={() => onNavigate(viewAllKey)}
            className="text-xs text-usac-700 hover:text-usac-900 font-medium"
          >
            Ver todos →
          </button>
        )}
      </div>
      <div className="divide-y divide-slate-50">
        {!items || items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-400">Sin registros recientes</p>
        ) : (
          items.slice(0, 5).map((item, i) => (
            <div key={item.id ?? i} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-700 truncate font-medium">{item.primary}</p>
                <p className="text-xs text-slate-400 truncate">{item.secondary}</p>
              </div>
              {item.badge && <Badge value={item.badge} />}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function Dashboard({ onNavigate }) {
  const { data: assets, loading: loadingAssets } = useApi(assetsApi.getAll);
  const { data: licenses, loading: loadingLicenses } = useApi(licensesApi.getAll);
  const { data: maintenance, loading: loadingMaint } = useApi(maintenanceApi.getAll);
  const { data: assignments, loading: loadingAssign } = useApi(assignmentsApi.getAll);
  const { data: users, loading: loadingUsers } = useApi(usersApi.getAll);

  const loading = loadingAssets || loadingLicenses || loadingMaint || loadingAssign || loadingUsers;

  const activeAssets = assets?.filter((a) => a.status === "active").length ?? 0;
  const expiredLicenses = licenses?.filter((l) => l.status === "expired").length ?? 0;
  const pendingMaint = maintenance?.filter((m) => m.status === "pending" || m.status === "in_progress").length ?? 0;
  const activeAssign = assignments?.filter((a) => !a.returnedDate).length ?? 0;

  const recentAssets = (assets || []).slice(-5).reverse().map((a) => ({
    id: a.id,
    primary: a.assetName,
    secondary: `${a.assetType} · ${a.location}`,
    badge: a.status,
  }));

  const recentMaint = (maintenance || []).slice(-5).reverse().map((m) => ({
    id: m.id,
    primary: m.assetName || `Activo #${m.assetId}`,
    secondary: `${m.type === "preventive" ? "Preventivo" : "Correctivo"} · ${m.scheduledDate}`,
    badge: m.status,
  }));

  const recentLicenses = (licenses || []).slice(-5).reverse().map((l) => ({
    id: l.id,
    primary: l.softwareName,
    secondary: l.expirationDate ? `Vence: ${l.expirationDate}` : "Sin fecha",
    badge: l.status,
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Activos registrados"
          value={assets?.length ?? 0}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Activos en servicio"
          value={activeAssets}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Mantenimientos pendientes"
          value={pendingMaint}
          color={pendingMaint > 0 ? "red" : "stone"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          }
        />
        <StatCard
          label="Licencias expiradas"
          value={expiredLicenses}
          color={expiredLicenses > 0 ? "red" : "stone"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Asignaciones activas"
          value={activeAssign}
          color="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Usuarios registrados"
          value={users?.length ?? 0}
          color="stone"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Recent panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentList
          title="Activos recientes"
          items={recentAssets}
          onNavigate={onNavigate}
          viewAllKey="assets"
          onViewAll
        />
        <RecentList
          title="Mantenimientos"
          items={recentMaint}
          onNavigate={onNavigate}
          viewAllKey="maintenance"
          onViewAll
        />
        <RecentList
          title="Licencias"
          items={recentLicenses}
          onNavigate={onNavigate}
          viewAllKey="licenses"
          onViewAll
        />
      </div>
    </div>
  );
}
