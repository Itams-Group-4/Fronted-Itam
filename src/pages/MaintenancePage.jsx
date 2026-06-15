import { useState } from "react";
import { useApi, useToast } from "../hooks/useApi";
import { maintenanceApi, assetsApi, usersApi } from "../services/api";
import {
  Card, Table, Badge, Button, Modal, Input, Select, Textarea,
  PageHeader, LoadingSpinner, ErrorMsg, Toast, ConfirmDialog,
} from "../components/ui/index";

const EMPTY_FORM = {
  assetId: "", scheduledDate: "", type: "preventive",
  status: "pending", description: "", technicianId: "",
};

function MaintenanceForm({ form, onChange, assets, users, errors }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Select label="Activo *" value={form.assetId} onChange={(e) => onChange("assetId", e.target.value)} error={errors?.assetId} className="col-span-2">
        <option value="">Seleccionar activo…</option>
        {(assets || []).map((a) => (
          <option key={a.id} value={a.id}>{a.assetName}</option>
        ))}
      </Select>
      <Input label="Fecha programada *" type="date" value={form.scheduledDate} onChange={(e) => onChange("scheduledDate", e.target.value)} error={errors?.scheduledDate} />
      <Select label="Tipo *" value={form.type} onChange={(e) => onChange("type", e.target.value)}>
        <option value="preventive">Preventivo</option>
        <option value="corrective">Correctivo</option>
      </Select>
      <Select label="Estado" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="completed">Completado</option>
        <option value="cancelled">Cancelado</option>
      </Select>
      <Select label="Técnico asignado" value={form.technicianId} onChange={(e) => onChange("technicianId", e.target.value)}>
        <option value="">Sin asignar</option>
        {(users || []).map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </Select>
      <Textarea label="Descripción" value={form.description} onChange={(e) => onChange("description", e.target.value)} className="col-span-2" />
    </div>
  );
}

export default function MaintenancePage() {
  const { data: maintenance, loading, error, refetch } = useApi(maintenanceApi.getAll);
  const { data: assets } = useApi(assetsApi.getAll);
  const { data: users } = useApi(usersApi.getAll);
  const { toast, showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState("all");

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true);
  }

  function openEdit(m) {
    setEditing(m);
    setForm({
      assetId: m.assetId || "",
      scheduledDate: m.scheduledDate || "",
      type: m.type || "preventive",
      status: m.status || "pending",
      description: m.description || "",
      technicianId: m.technician?.id || "",
    });
    setErrors({}); setModalOpen(true);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.assetId) errs.assetId = "Requerido";
    if (!form.scheduledDate) errs.scheduledDate = "Requerido";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        assetId: parseInt(form.assetId),
        technicianId: form.technicianId ? parseInt(form.technicianId) : null,
      };
      if (editing) {
        await maintenanceApi.update(editing.id, payload);
        showToast("Mantenimiento actualizado");
      } else {
        await maintenanceApi.create(payload);
        showToast("Mantenimiento creado");
      }
      setModalOpen(false); refetch();
    } catch (e) {
      showToast(e.message || "Error al guardar", "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await maintenanceApi.delete(confirmDelete.id);
      showToast("Registro eliminado"); refetch();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "error");
    } finally { setConfirmDelete(null); }
  }

  const filtered = (maintenance || []).filter(
    (m) => filter === "all" || m.status === filter
  );

  const counts = {
    all: maintenance?.length ?? 0,
    pending: maintenance?.filter((m) => m.status === "pending").length ?? 0,
    in_progress: maintenance?.filter((m) => m.status === "in_progress").length ?? 0,
    completed: maintenance?.filter((m) => m.status === "completed").length ?? 0,
  };

  const columns = [
    { key: "assetName", label: "Activo", render: (v, row) => v || `Activo #${row.assetId}` },
    {
      key: "type",
      label: "Tipo",
      render: (v) => (
        <span className="text-xs font-medium">
          {v === "preventive" ? "Preventivo" : "Correctivo"}
        </span>
      ),
    },
    { key: "scheduledDate", label: "Fecha programada" },
    { key: "status", label: "Estado", render: (v) => <Badge value={v} /> },
    { key: "technician", label: "Técnico", render: (v) => v?.name || "—" },
    { key: "description", label: "Descripción", render: (v) => v ? <span className="truncate max-w-xs block text-slate-500 text-xs">{v}</span> : "—" },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMsg message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Mantenimiento"
        description="Historial y programación de mantenimientos"
        action={
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo mantenimiento
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-1">
          {[["all", "Todos"], ["pending", "Pendientes"], ["in_progress", "En progreso"], ["completed", "Completados"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === v ? "bg-usac-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {l} ({counts[v] ?? 0})
            </button>
          ))}
        </div>
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={(row) => setConfirmDelete(row)} emptyMsg="No hay registros de mantenimiento" />
      </Card>

      {modalOpen && (
        <Modal title={editing ? "Editar mantenimiento" : "Nuevo mantenimiento"} onClose={() => setModalOpen(false)} size="lg">
          <MaintenanceForm form={form} onChange={handleChange} assets={assets} users={users} errors={errors} />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Eliminar este registro de mantenimiento?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </>
  );
}
