// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, size = "md" }) {
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
const BADGE_VARIANTS = {
  active:        "bg-emerald-100 text-emerald-800",
  inactive:      "bg-slate-100 text-slate-600",
  in_maintenance:"bg-orange-100 text-orange-800",
  retired:       "bg-red-100 text-red-700",
  expired:       "bg-red-100 text-red-700",
  cancelled:     "bg-slate-100 text-slate-500",
  pending:       "bg-yellow-100 text-yellow-800",
  in_progress:   "bg-indigo-100 text-indigo-800",
  completed:     "bg-emerald-100 text-emerald-800",
  admin:         "bg-usac-100 text-usac-800",
  technician:    "bg-slate-100 text-slate-700",
};

const BADGE_LABELS = {
  active: "Activo", inactive: "Inactivo", in_maintenance: "En mantenimiento",
  retired: "Retirado", expired: "Expirada", cancelled: "Cancelado",
  pending: "Pendiente", in_progress: "En progreso", completed: "Completado",
  admin: "Admin", technician: "Técnico",
};

export function Badge({ value }) {
  const cls = BADGE_VARIANTS[value] || "bg-slate-100 text-slate-600";
  const label = BADGE_LABELS[value] || value;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variants = {
    primary: "bg-usac-700 hover:bg-usac-800 text-white",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "hover:bg-slate-100 text-slate-600",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5" };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white transition-colors
          ${error
            ? "border-red-400 focus:ring-red-300"
            : "border-slate-300 focus:border-usac-500 focus:ring-usac-200"
          }
          focus:outline-none focus:ring-2
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white transition-colors
          ${error ? "border-red-400" : "border-slate-300 focus:border-usac-500 focus:ring-usac-200"}
          focus:outline-none focus:ring-2
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        rows={3}
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white transition-colors resize-none
          ${error ? "border-red-400" : "border-slate-300 focus:border-usac-500 focus:ring-usac-200"}
          focus:outline-none focus:ring-2
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Table ──────────────────────────────────────────────────────────────────
export function Table({ columns, data, onEdit, onDelete, emptyMsg = "Sin registros" }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded text-slate-400 hover:text-usac-700 hover:bg-usac-50 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-usac-50 text-usac-700",
    green: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    red: "bg-red-50 text-red-700",
    stone: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color] || colors.blue}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  const styles = {
    success: "bg-emerald-700 text-white",
    error: "bg-red-700 text-white",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${styles[type]}`}>
      {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── ConfirmDialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-slate-700 text-sm mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}

// ── LoadingSpinner ─────────────────────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-usac-700 rounded-full animate-spin" />
    </div>
  );
}

// ── ErrorMsg ───────────────────────────────────────────────────────────────
export function ErrorMsg({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
      <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-sm">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}

// ── PageHeader ─────────────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
