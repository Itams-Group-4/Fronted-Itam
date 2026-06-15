import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ConsultasPage from "./ConsultasPage";
import { IS_MOCK } from "../services/api";

function ShieldIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3l7 3v5c0 4.418-3.134 8.418-7 10-3.866-1.582-7-5.582-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8L15 10" />
    </svg>
  );
}

function LogoImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-usac-700/40 ${className}`}>
        <ShieldIcon className="w-7 h-7 text-usac-100" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

// Rellena el formulario con un usuario de prueba con un click
function MockCredentialHint({ onFill }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
      <p className="font-semibold mb-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Modo demo activo — credenciales de prueba
      </p>
      <div className="space-y-0.5 text-amber-700">
        <button onClick={() => onFill("carlos.lopez@itam.com")}
          className="block hover:underline text-left w-full">
          Admin → carlos.lopez@itam.com
        </button>
        <button onClick={() => onFill("ana.martinez@itam.com")}
          className="block hover:underline text-left w-full">
          Técnico → ana.martinez@itam.com
        </button>
      </div>
      <p className="mt-1.5 text-amber-600">Contraseña: <span className="font-mono font-semibold">password123</span></p>
    </div>
  );
}

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConsultas, setShowConsultas] = useState(false);

  if (showConsultas) return <ConsultasPage onBack={() => setShowConsultas(false)} />;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const fillCredentials = (email) => {
    setForm({ email, password: "password123" });
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.email.trim() || !form.password.trim()) {
      setLocalError("Ingresa tu correo y tu contraseña");
      return;
    }
    try {
      await login(form.email.trim(), form.password);
    } catch { /* el error se muestra desde el contexto */ }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Panel institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-[url('/images/T3.jpg')] bg-cover bg-center text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-usac-950/90 via-usac-900/75 to-usac-800/70" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white" />
          <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full border-[30px] border-white" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <LogoImage src="/images/logo-usac.png" alt="Universidad de San Carlos de Guatemala"
            className="w-14 h-14 object-contain rounded-xl bg-white/10 p-2" />
          <LogoImage src="/images/logo-fiusac.png" alt="Facultad de Ingeniería"
            className="w-14 h-14 object-contain rounded-xl bg-white/10 p-2" />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-usac-200 text-sm font-medium uppercase tracking-widest mb-3">
            Universidad de San Carlos de Guatemala
          </p>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Sistema de Gestión de Activos de TI (ITAM)
          </h1>
          <p className="text-usac-100 text-sm leading-relaxed">
            Facultad de Ingeniería · Escuela de Ciencias y Sistemas
          </p>
          <p className="text-usac-200/80 text-sm mt-4 leading-relaxed">
            Plataforma interna para el control, asignación y mantenimiento
            del inventario tecnológico institucional.
          </p>
        </div>

        <div className="relative z-10 text-usac-300 text-xs">
          © {new Date().getFullYear()} Escuela de Ciencias y Sistemas — USAC
        </div>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Branding mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <LogoImage src="/images/logo-usac.png" alt="USAC"
              className="w-12 h-12 object-contain rounded-lg bg-usac-800 p-2" />
            <div>
              <p className="text-xs font-semibold text-usac-700 uppercase tracking-widest">USAC · ECYS</p>
              <p className="text-sm text-slate-500">Gestión de Activos de TI</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="hidden lg:flex w-12 h-12 rounded-xl bg-usac-800 items-center justify-center mb-4">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingresa con tu correo institucional y contraseña.
            </p>
          </div>

          {/* Hint de credenciales en modo mock */}
          {IS_MOCK && (
            <div className="mb-5">
              <MockCredentialHint onFill={fillCredentials} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input type="email" name="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="usuario@itam.com"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-usac-200 focus:border-usac-500 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password"
                  autoComplete="current-password" value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-usac-200 focus:border-usac-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}>
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                <svg className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-usac-700 hover:bg-usac-800
                text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 whitespace-nowrap">o sin iniciar sesión</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button type="button" onClick={() => setShowConsultas(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg
                border border-slate-300 bg-white hover:bg-slate-50
                text-slate-700 text-sm font-medium py-2.5 transition-colors">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
              </svg>
              Ver inventario disponible
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            Acceso restringido al personal administrativo y técnico de la
            Escuela de Ciencias y Sistemas, USAC.
          </p>
        </div>
      </div>
    </div>
  );
}
