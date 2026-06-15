import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import AssetsPage from "./pages/AssetsPage";
import LicensesPage from "./pages/LicensesPage";
import MaintenancePage from "./pages/MaintenancePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import UsersPage from "./pages/UsersPage";

const PAGES = {
  dashboard: Dashboard,
  assets: AssetsPage,
  licenses: LicensesPage,
  maintenance: MaintenancePage,
  assignments: AssignmentsPage,
  users: UsersPage,
};

const PAGE_LABELS = {
  dashboard: "Inicio",
  assets: "Activos",
  licenses: "Licencias",
  maintenance: "Mantenimiento",
  assignments: "Asignaciones",
  users: "Usuarios",
};

// Páginas visibles según el rol del usuario autenticado.
// Mantener sincronizado con los `roles` definidos en Sidebar.jsx.
const PAGE_ROLES = {
  dashboard: ["admin"],
  assets: ["admin", "technician"],
  licenses: ["admin"],
  maintenance: ["admin", "technician"],
  assignments: ["admin", "technician"],
  users: ["admin"],
};

function defaultPageForRole(role) {
  return role === "admin" ? "dashboard" : "assets";
}

function AppShell() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => defaultPageForRole(user?.role));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Si el usuario no tiene permiso para la página actual (p. ej. cambió de
  // sesión o el rol no incluye esa vista), redirige a su página por defecto.
  useEffect(() => {
    const allowedRoles = PAGE_ROLES[currentPage] || [];
    if (!allowedRoles.includes(user?.role)) {
      setCurrentPage(defaultPageForRole(user?.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleNavigate = (page) => {
    const allowedRoles = PAGE_ROLES[page] || [];
    if (allowedRoles.includes(user?.role)) {
      setCurrentPage(page);
    }
  };

  const PageComponent = PAGES[currentPage] || Dashboard;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          pageLabel={PAGE_LABELS[currentPage]}
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <PageComponent onNavigate={handleNavigate} />
        </main>
      </div>
    </div>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
