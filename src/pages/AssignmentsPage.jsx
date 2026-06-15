import { useState } from "react";
import { useApi, useToast } from "../hooks/useApi";
import { assignmentsApi, assetsApi, usersApi } from "../services/api";
import {
  Card, Table, Badge, Button, Modal, Input, Select, Textarea,
  PageHeader, LoadingSpinner, ErrorMsg, Toast, ConfirmDialog,
} from "../components/ui/index";

const EMPTY_FORM = {
  assetId: "", userId: "", assignedDate: "", returnedDate: "", notes: "",
};

function AssignmentForm({ form, onChange, assets, users, errors }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Select label="Activo *" value={form.assetId} onChange={(e) => onChange("assetId", e.target.value)} error={errors?.assetId} className="col-span-2">
        <option value="">Seleccionar activo…</option>
        {(assets || []).map((a) => (
          <option key={a.id} value={a.id}>{a.assetName} — {a.serialNumber}</option>
        ))}
      </Select>
      <Select label="Usuario *" value={form.userId} onChange={(e) => onChange("userId", e.target.value)} error={errors?.userId} className="col-span-2">
        <option value="">Seleccionar usuario…</option>
        {(users || []).map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </Select>
      <Input label="Fecha de asignación" type="date" value={form.assignedDate} onChange={(e) => onChange("assignedDate", e.target.value)} />
      <Input label="Fecha de devolución" type="date" value={form.returnedDate} onChange={(e) => onChange("returnedDate", e.target.value)} />
      <Textarea label="Notas" value={form.notes} onChange={(e) => onChange("notes", e.target.value)} className="col-span-2" />
    </div>
  );
}

export default function AssignmentsPage() {
  const { data: assignments, loading, error, refetch } = useApi(assignmentsApi.getAll);
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

  function openEdit(a) {
    setEditing(a);
    setForm({
      assetId: a.assetId || "",
      userId: a.user?.id || "",
      assignedDate: a.assignedDate || "",
      returnedDate: a.returnedDate || "",
      notes: a.notes || "",
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
    if (!form.userId) errs.userId = "Requerido";
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
        userId: parseInt(form.userId),
        assignedDate: form.assignedDate || null,
        returnedDate: form.returnedDate || null,
      };
      if (editing) {
        await assignmentsApi.update(editing.id, payload);
        showToast("Asignación actualizada");
      } else {
        await assignmentsApi.create(payload);
        showToast("Asignación creada");
      }
      setModalOpen(false); refetch();
    } catch (e) {
      showToast(e.message || "Error al guardar", "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await assignmentsApi.delete(confirmDelete.id);
      showToast("Asignación eliminada"); refetch();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "error");
    } finally { setConfirmDelete(null); }
  }

  const active = (assignments || []).filter((a) => !a.returnedDate);
  const returned = (assignments || []).filter((a) => a.returnedDate);

  const filtered = filter === "all" ? (assignments || []) : filter === "active" ? active : returned;

  const columns = [
    { key: "assetName", label: "Activo", render: (v, row) => v || `Activo #${row.assetId}` },
    { key: "user", label: "Usuario", render: (v) => v?.name || "—" },
    { key: "assignedDate", label: "Asignado el" },
    { key: "returnedDate", label: "Devuelto el", render: (v) => v || "—" },
    {
      key: "returnedDate",
      label: "Estado",
      render: (v) => <Badge value={v ? "completed" : "active"} />,
    },
    { key: "notes", label: "Notas", render: (v) => v ? <span className="text-xs text-slate-500 truncate max-w-xs block">{v}</span> : "—" },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMsg message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Asignaciones"
        description="Control de activos asignados a usuarios"
        action={
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva asignación
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex gap-1">
          {[["all", "Todas", assignments?.length ?? 0], ["active", "Activas", active.length], ["returned", "Devueltas", returned.length]].map(([v, l, c]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === v ? "bg-usac-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {l} ({c})
            </button>
          ))}
        </div>
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={(row) => setConfirmDelete(row)} emptyMsg="No hay asignaciones registradas" />
      </Card>

      {modalOpen && (
        <Modal title={editing ? "Editar asignación" : "Nueva asignación"} onClose={() => setModalOpen(false)} size="lg">
          <AssignmentForm form={form} onChange={handleChange} assets={assets} users={users} errors={errors} />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear asignación"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="¿Eliminar esta asignación?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </>
  );
}
