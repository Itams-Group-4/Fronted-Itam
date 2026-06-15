import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Inicio",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "assets",
    label: "Activos",
    roles: ["admin", "technician"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "licenses",
    label: "Licencias",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: "maintenance",
    label: "Mantenimiento",
    roles: ["admin", "technician"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    key: "assignments",
    label: "Asignaciones",
    roles: ["admin", "technician"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "users",
    label: "Usuarios",
    roles: ["admin"],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function LogoMark() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-9 h-9 rounded-lg bg-usac-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.418-3.134 8.418-7 10-3.866-1.582-7-5.582-7-10V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8L15 10" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src="/images/logo-usac.png"
      alt="USAC"
      className="w-9 h-9 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export default function Sidebar({ currentPage, onNavigate, open }) {
  const { user, logout, isAdmin } = useAuth();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => onNavigate(currentPage)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col w-64 bg-usac-950 text-usac-100
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-usac-800/60">
          <LogoMark />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">ITAM · ECYS</p>
            <p className="text-usac-300 text-xs truncate">Facultad de Ingeniería · USAC</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ key, label, icon }) => {
            const active = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150 text-left
                  ${active
                    ? "bg-usac-600 text-white shadow-sm"
                    : "text-usac-200 hover:bg-usac-900 hover:text-white"
                  }
                `}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </nav>

        {/* User / footer */}
        <div className="px-3 py-4 border-t border-usac-800/60 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-usac-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-usac-300 truncate">
                {isAdmin ? "Administrador" : "Técnico"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              text-usac-300 hover:bg-usac-900 hover:text-white transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar sesión
          </button>
          <p className="text-usac-500 text-[11px] px-2">v1.0.0 · Escuela de Ciencias y Sistemas</p>
        </div>
      </aside>
    </>
  );
}
