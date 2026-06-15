# ITAM Frontend

Interfaz web para el sistema de gestión de activos de TI (ITAM).  
Construido con **React 18 + Vite + Tailwind CSS**.

---

## Requisitos

- Node.js 18 o superior
- Backend Spring Boot corriendo en `http://localhost:8080`
- Base de datos PostgreSQL inicializada (ver `database/` en el backend)

---

## Instalación

```bash
cd itam-frontend
npm install
```

---

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).  
Las llamadas a `/api/*` se redirigen automáticamente al backend en `8080` gracias al proxy de Vite.

---

## Producción

```bash
npm run build
```

Los archivos quedan en `dist/`. Sirve esa carpeta con cualquier servidor estático (Nginx, etc.) y asegúrate de que el backend esté en la URL correcta configurada en `VITE_API_URL`.

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```env
VITE_API_URL=http://localhost:8080
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       # Navegación lateral
│   │   └── Header.jsx        # Barra superior
│   └── ui/
│       └── index.jsx         # Componentes reutilizables
├── hooks/
│   └── useApi.js             # Hook para llamadas al API
├── pages/
│   ├── Dashboard.jsx         # Resumen general
│   ├── AssetsPage.jsx        # Gestión de activos
│   ├── LicensesPage.jsx      # Gestión de licencias
│   ├── MaintenancePage.jsx   # Mantenimientos
│   ├── AssignmentsPage.jsx   # Asignaciones
│   └── UsersPage.jsx         # Usuarios
├── services/
│   └── api.js                # Capa de servicio REST
├── App.jsx
└── main.jsx
```

---

## Endpoints del backend esperados

| Módulo        | Endpoints                              |
|---------------|----------------------------------------|
| Activos       | `GET/POST /api/assets`, `PUT/DELETE /api/assets/{id}` |
| Licencias     | `GET/POST /api/licenses`, `PUT/DELETE /api/licenses/{id}` |
| Mantenimiento | `GET/POST /api/maintenance`, `PUT/DELETE /api/maintenance/{id}` |
| Asignaciones  | `GET/POST /api/assignments`, `PUT/DELETE /api/assignments/{id}` |
| Usuarios      | `GET/POST /api/users`, `PUT/DELETE /api/users/{id}` |
| Health        | `GET /api/health` |
