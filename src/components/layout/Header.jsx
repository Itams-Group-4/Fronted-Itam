import { useAuth } from "../../context/AuthContext";

export default function Header({ pageLabel, onMenuClick }) {
  const { user, logout, isMockMode } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{pageLabel}</h1>

        {/* Badge modo mock */}
        {isMockMode && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            MOCK
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-medium text-slate-700 leading-none">{user.name}</span>
            <span className="text-xs text-slate-400 capitalize">{user.role}</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center
          text-white text-sm font-semibold flex-shrink-0 select-none">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
