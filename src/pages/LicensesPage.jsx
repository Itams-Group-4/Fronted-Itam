import { useState } from "react";
import { useApi, useToast } from "../hooks/useApi";
import { licensesApi, assetsApi, usersApi } from "../services/api";
import {
  Card, Table, Badge, Button, Modal, Input, Select,
  PageHeader, LoadingSpinner, ErrorMsg, Toast, ConfirmDialog,
} from "../components/ui/index";

const EMPTY_FORM = {
  softwareName: "", licenseKey: "", expirationDate: "",
  status: "active", assetId: "", responsibleId: "",
};

function LicenseForm({ form, onChange, assets, users, errors }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input label="Software *" value={form.softwareName} onChange={(e) => onChange("softwareName", e.target.value)} error={errors?.softwareName} className="col-span-2" />
      <Input label="Clave de licencia" value={form.licenseKey} onChange={(e) => onChange("licenseKey", e.target.value)} className="col-span-2" />
      <Input label="Fecha de expiración" type="date" value={form.expirationDate} onChange={(e) => onChange("expirationDate", e.target.value)} />
      <Select label="Estado" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
        <option value="active">Activa</option>
        <option value="expired">Expirada</option>
        <option value="cancelled">Cancelada</option>
      </Select>
      <Select label="Activo asociado" value={form.assetId} onChange={(e) => onChange("assetId", e.target.value)}>
        <option value="">Sin activo</option>
        {(assets || []).map((a) => (
          <option key={a.id} value={a.id}>{a.assetName}</option>
        ))}
      </Select>
      <Select label="Responsable" value={form.responsibleId} onChange={(e) => onChange("responsibleId", e.target.value)}>
        <option value="">Sin asignar</option>
        {(users || []).map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </Select>
    </div>
  );
}

export default function LicensesPage() {
  const { data: licenses, loading, error, refetch } = useApi(licensesApi.getAll);
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
  const [search, setSearch] = useState("");

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true);
  }

  function openEdit(lic) {
    setEditing(lic);
    setForm({
      softwareName: lic.softwareName || "",
      licenseKey: lic.licenseKey || "",
      expirationDate: lic.expirationDate || "",
      status: lic.status || "active",
      assetId: lic.assetId || "",
      responsibleId: lic.responsible?.id || "",
    });
    setErrors({}); setModalOpen(true);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.softwareName.trim()) errs.softwareName = "Requerido";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        assetId: form.assetId ? parseInt(form.assetId) : null,
        responsibleId: form.responsibleId ? parseInt(form.responsibleId) : null,
        expirationDate: form.expirationDate || null,
      };
      if (editing) {
        await licensesApi.update(editing.id, payload);
        showToast("Licencia actualizada");
      } else {
        await licensesApi.create(payload);
        showToast("Licencia creada");
      }
      setModalOpen(false); refetch();
    } catch (e) {
      showToast(e.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await licensesApi.delete(confirmDelete.id);
      showToast("Licencia eliminada"); refetch();
    } catch (e) {
      showToast(e.message || "Error al eliminar", "error");
    } finally { setConfirmDelete(null); }
  }

  const filtered = (licenses || []).filter((l) => {
    const matchFilter = filter === "all" || l.status === filter;
    const matchSearch = !search || l.softwareName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const columns = [
    { key: "softwareName", label: "Software" },
    { key: "licenseKey", label: "Clave", render: (v) => v ? <span className="font-mono text-xs text-slate-500">{v}</span> : "—" },
    { key: "expirationDate", label: "Vencimiento", render: (v) => v || "—" },
    { key: "status", label: "Estado", render: (v) => <Badge value={v} /> },
    { key: "assetId", label: "Activo ID", render: (v) => v || "—" },
    { key: "responsible", label: "Responsable", render: (v) => v?.name || "—" },
  ];

  const counts = { all: licenses?.length ?? 0, active: licenses?.filter((l) => l.status === "active").length ?? 0, expired: licenses?.filter((l) => l.status === "expired").length ?? 0 };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMsg message={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Licencias"
        description="Control de licencias de software"
        action={
          <Button onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva licencia
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {[["all", "Todas"], ["active", "Activas"], ["expired", "Expiradas"]].map(([v, l]) => (
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
          <input
            type="text"
            placeholder="Buscar software…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto w-48 text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-usac-200 focus:border-usac-500"
          />
        </div>
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={(row) => setConfirmDelete(row)} emptyMsg="No hay licencias registradas" />
      </Card>

      {modalOpen && (
        <Modal title={editing ? "Editar licencia" : "Nueva licencia"} onClose={() => setModalOpen(false)}>
          <LicenseForm form={form} onChange={handleChange} assets={assets} users={users} errors={errors} />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear licencia"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Eliminar la licencia de "${confirmDelete.softwareName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </>
  );
}
