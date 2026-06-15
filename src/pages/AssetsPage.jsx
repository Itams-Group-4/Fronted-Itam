import { useState } from "react";
import { useApi, useToast } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { assetsApi, usersApi } from "../services/api";
import {
  Card, Table, Badge, Button, Modal, Input, Select, Textarea,
  PageHeader, LoadingSpinner, ErrorMsg, Toast, ConfirmDialog,
} from "../components/ui/index";



const EMPTY_FORM = {
  assetName: "", assetType: "", model: "", serialNumber: "",
  location: "", status: "active", acquisitionDate: "", acquisitionValue: "",
  observations: "", responsibleId: "",
};

function AssetForm({ form, onChange, users, errors }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input label="Nombre del activo *" value={form.assetName} onChange={(e) => onChange("assetName", e.target.value)} error={errors?.assetName} className="col-span-2" />
      <Input label="Tipo *" placeholder="Laptop, Server, Printer…" value={form.assetType} onChange={(e) => onChange("assetType", e.target.value)} error={errors?.assetType} />
      <Input label="Modelo *" value={form.model} onChange={(e) => onChange("model", e.target.value)} error={errors?.model} />
      <Input label="Número de serie *" value={form.serialNumber} onChange={(e) => onChange("serialNumber", e.target.value)} error={errors?.serialNumber} />
      <Input label="Ubicación *" value={form.location} onChange={(e) => onChange("location", e.target.value)} error={errors?.location} />
      <Select label="Estado *" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
        <option value="in_maintenance">En mantenimiento</option>
        <option value="retired">Retirado</option>
      </Select>
      <Input label="Fecha de adquisición" type="date" value={form.acquisitionDate} onChange={(e) => onChange("acquisitionDate", e.target.value)} />
      <Input label="Valor de adquisición (Q)" type="number" step="0.01" value={form.acquisitionValue} onChange={(e) => onChange("acquisitionValue", e.target.value)} />
      <Select label="Responsable" value={form.responsibleId} onChange={(e) => onChange("responsibleId", e.target.value)} className="col-span-2">
        <option value="">Sin asignar</option>
        {(users || []).map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </Select>
      <Textarea label="Observaciones" value={form.observations} onChange={(e) => onChange("observations", e.target.value)} className="col-span-2" />
    </div>
  );
}

export default function AssetsPage() {
  const { isAdmin } = useAuth();
  const { data: assets, loading, error, refetch } = useApi(assetsApi.getAll);
  const { data: users } = useApi(usersApi.getAll);
  const { toast, showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(asset) {
    setEditing(asset);
    setForm({
      assetName: asset.assetName || "",
      assetType: asset.assetType || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      location: asset.location || "",
      status: asset.status || "active",
      acquisitionDate: asset.acquisitionDate || "",
      acquisitionValue: asset.acquisitionValue || "",
      observations: asset.observations || "",
      responsibleId: asset.responsible?.id || "",
    });
    setErrors({});
    setModalOpen(true);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.assetName.trim()) errs.assetName = "Requerido";
    if (!form.assetType.trim()) errs.assetType = "Requerido";
    if (!form.model.trim()) errs.model = "Requerido";
    if (!form.serialNumber.trim()) errs.serialNumber = "Requerido";
    if (!form.location.trim()) errs.location = "Requerido";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        acquisitionValue: form.acquisitionValue ? parseFloat(form.acquisitionValue) : null,
        responsibleId: form.responsibleId ? parseInt(form.responsibleId) : null,
        acquisitionDate: form.acquisitionDate || null,
      };
      if (editing) {
        await assetsApi.update(editing.id, payload);
        showToast("Activo actualizado");
      } else {
        await assetsApi.create(payload);
        showToast("Activo creado");
      }
      setModalOpen(false);
      refetch();
    } catch (e) {
      showToast(e.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await assetsApi.delete(confirmDelete.id);
      showToast("Activo eliminado");
      refetch();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "error");
    } finally {
      setConfirmDelete(null);
    }
  }

  const filtered = (assets || []).filter((a) =>
    !search || [a.assetName, a.assetType, a.serialNumber, a.location].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    { key: "assetName", label: "Nombre" },
    { key: "assetType", label: "Tipo" },
    { key: "serialNumber", label: "N° Serie" },
    { key: "location", label: "Ubicación" },
    { key: "status", label: "Estado", render: (v) => <Badge value={v} /> },
    {
      key: "responsible",
      label: "Responsable",
      render: (v) => v?.name || "—",
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMsg message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Activos"
        description="Inventario de hardware y equipos"
        action={
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo activo
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar por nombre, tipo, serie o ubicación…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-usac-200 focus:border-usac-500"
          />
        </div>
        <Table
          columns={columns}
          data={filtered}
          onEdit={openEdit}
          onDelete={isAdmin ? (row) => setConfirmDelete(row) : undefined}
          emptyMsg="No hay activos registrados"
        />
      </Card>

      {modalOpen && (
        <Modal
          title={editing ? "Editar activo" : "Nuevo activo"}
          onClose={() => setModalOpen(false)}
          size="lg"
        >
          <AssetForm form={form} onChange={handleChange} users={users} errors={errors} />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear activo"}
            </Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Eliminar el activo "${confirmDelete.assetName}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </>
  );
}