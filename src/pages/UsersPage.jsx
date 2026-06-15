import { useState } from "react";
import { useApi, useToast } from "../hooks/useApi";
import { usersApi } from "../services/api";
import {
  Card, Table, Badge, Button, Modal, Input, Select,
  PageHeader, LoadingSpinner, ErrorMsg, Toast, ConfirmDialog,
} from "../components/ui/index";

const EMPTY_FORM = { name: "", email: "", password: "", role: "technician" };

function UserForm({ form, onChange, errors, isEditing }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input label="Nombre *" value={form.name} onChange={(e) => onChange("name", e.target.value)} error={errors?.name} className="col-span-2" />
      <Input label="Correo *" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} error={errors?.email} className="col-span-2" />
      <Input
        label={isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
        type="password"
        value={form.password}
        onChange={(e) => onChange("password", e.target.value)}
        error={errors?.password}
        className="col-span-2"
        autoComplete="new-password"
      />
      <Select label="Rol" value={form.role} onChange={(e) => onChange("role", e.target.value)} className="col-span-2">
        <option value="admin">Administrador</option>
        <option value="technician">Técnico</option>
      </Select>
    </div>
  );
}

export default function UsersPage() {
  const { data: users, loading, error, refetch } = useApi(usersApi.getAll);
  const { toast, showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role || "technician" });
    setErrors({}); setModalOpen(true);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Requerido";
    if (!form.email.trim()) errs.email = "Requerido";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Correo inválido";
    if (!editing && !form.password) errs.password = "Requerido";
    if (form.password && form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await usersApi.update(editing.id, payload);
        showToast("Usuario actualizado");
      } else {
        await usersApi.create(payload);
        showToast("Usuario creado");
      }
      setModalOpen(false); refetch();
    } catch (e) {
      showToast(e.message || "Error al guardar", "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await usersApi.delete(confirmDelete.id);
      showToast("Usuario eliminado"); refetch();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "error");
    } finally { setConfirmDelete(null); }
  }

  const filtered = (users || []).filter((u) =>
    !search || [u.name, u.email, u.role].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-usac-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {v?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-700">{v}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Rol", render: (v) => <Badge value={v} /> },
    { key: "createdAt", label: "Registrado", render: (v) => v ? new Date(v).toLocaleDateString("es-GT") : "—" },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMsg message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administración de cuentas del sistema"
        action={
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-usac-200 focus:border-usac-500"
          />
        </div>
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={(row) => setConfirmDelete(row)} emptyMsg="No hay usuarios registrados" />
      </Card>

      {modalOpen && (
        <Modal title={editing ? "Editar usuario" : "Nuevo usuario"} onClose={() => setModalOpen(false)}>
          <UserForm form={form} onChange={handleChange} errors={errors} isEditing={!!editing} />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear usuario"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Eliminar al usuario "${confirmDelete.name}"? Esto podría afectar activos y asignaciones relacionadas.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </>
  );
}
