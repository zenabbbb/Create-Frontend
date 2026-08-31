import { useState, useEffect, useMemo } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "./api/users";
import { getFields, createField, updateField, deleteField } from "./api/fields";
import { getProjects, createProject, updateProject, deleteProject } from "./api/projects";
import { getMemberships, createMembership, updateMembership, deleteMembership } from "./api/memberships";
import { getComponents, createComponent, updateComponent, deleteComponent } from "./api/components";
import { getReservations, createReservation, updateReservation, deleteReservation } from "./api/componentReservations";
import { getProjectPictures, createProjectPicture, updateProjectPicture, deleteProjectPicture } from "./api/projectPictures";
import { getComponentPictures, createComponentPicture, updateComponentPicture, deleteComponentPicture } from "./api/componentPictures";
import "./App.css";

const roleColors = { STUDENT: "#2f6fb0", TUTOR: "#3f7d4f", SUPERVISOR: "#8a4b6b" };

// Each module's `fields` mirrors its Create/Patch model in API_CONTRACT.md exactly.
const MODULES = [
  {
    key: "users", num: "02", label: "Users",
    list: getUsers, create: createUser, update: updateUser, remove: deleteUser,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "email", type: "text", required: true },
      { name: "role", type: "select", options: ["STUDENT", "TUTOR", "SUPERVISOR"], required: true },
      { name: "fieldId", type: "text", required: true, placeholder: "field UUID" },
      { name: "projectIds", type: "list", placeholder: "comma-separated UUIDs" },
    ],
  },
  {
    key: "fields", num: "03", label: "Fields",
    list: getFields, create: createField, update: updateField, remove: deleteField,
    fields: [{ name: "fieldName", type: "text", required: true }],
  },
  {
    key: "projects", num: "04", label: "Projects",
    list: getProjects, create: createProject, update: updateProject, remove: deleteProject,
    fields: [
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "academicYear", type: "number", required: true },
      { name: "tutorId", type: "number", placeholder: "optional" },
      { name: "supervisorId", type: "number", required: true },
      { name: "fieldId", type: "text", required: true, placeholder: "field UUID" },
    ],
  },
  {
    key: "memberships", num: "05", label: "Memberships",
    list: getMemberships, create: createMembership, update: updateMembership, remove: deleteMembership,
    fields: [
      { name: "projectId", type: "text", required: true, placeholder: "project UUID" },
      { name: "memberId", type: "number", required: true },
    ],
  },
  {
    key: "components", num: "06", label: "Components",
    list: getComponents, create: createComponent, update: updateComponent, remove: deleteComponent,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "totalQuantity", type: "number", required: true },
      { name: "availableQuantity", type: "number", required: true },
    ],
  },
  {
    key: "reservations", num: "07", label: "Reservations",
    list: getReservations, create: createReservation, update: updateReservation, remove: deleteReservation,
    fields: [
      { name: "componentId", type: "text", required: true, placeholder: "component UUID" },
      { name: "reservedFrom", type: "datetime", required: true },
      { name: "reservedTo", type: "datetime", required: true },
      { name: "quantity", type: "number", required: true },
      { name: "borrowerId", type: "number", required: true },
    ],
  },
  {
    key: "projectPictures", num: "08", label: "Project Pictures",
    list: getProjectPictures, create: createProjectPicture, update: updateProjectPicture, remove: deleteProjectPicture,
    fields: [
      { name: "projectId", type: "text", required: true, placeholder: "project UUID" },
      { name: "storageKey", type: "text", required: true },
      { name: "order", type: "number", required: true },
      { name: "caption", type: "text" },
    ],
  },
  {
    key: "componentPictures", num: "09", label: "Component Pictures",
    list: getComponentPictures, create: createComponentPicture, update: updateComponentPicture, remove: deleteComponentPicture,
    fields: [
      { name: "componentId", type: "text", required: true, placeholder: "component UUID" },
      { name: "storageKey", type: "text", required: true },
      { name: "order", type: "number", required: true },
      { name: "caption", type: "text" },
    ],
  },
];

function StatusDot({ online }) {
  return <span className={`status-dot ${online ? "online" : "offline"}`} />;
}

function SkeletonRows({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}><div className="skeleton-bar" style={{ width: `${50 + ((r + c) % 4) * 12}%` }} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Converts an ISO datetime to the value <input type="datetime-local"> expects
function toLocalInput(iso) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function FormModal({ module, initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState(() => {
    const v = {};
    module.fields.forEach((f) => {
      let raw = initial ? initial[f.name] : "";
      if (f.type === "list") raw = Array.isArray(raw) ? raw.join(", ") : "";
      if (f.type === "datetime") raw = toLocalInput(raw);
      v[f.name] = raw ?? "";
    });
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const buildPayload = () => {
    const payload = isEdit ? { id: initial.id } : {};
    module.fields.forEach((f) => {
      let val = values[f.name];
      if (f.type === "number") val = val === "" ? undefined : Number(val);
      if (f.type === "list") {
        val = val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (f.type === "datetime") {
        val = val ? `${val}:00Z` : undefined;
      }
      payload[f.name] = val;
    });
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await module.update(payload);
      } else {
        await module.create(payload);
      }
      onSaved();
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? `Edit ${module.label.slice(0, -1)}` : `New ${module.label.slice(0, -1)}`}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {module.fields.map((f) => (
              <div className="form-field" key={f.name}>
                <label>{f.name}{f.required && <span className="req">*</span>}</label>
                {f.type === "select" ? (
                  <select
                    value={values[f.name]}
                    required={f.required}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : "text"}
                    value={values[f.name]}
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          {err && <div className="form-error">{err}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDelete({ label, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <p>Delete this {label.toLowerCase().slice(0, -1)}? This cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function DataTable({ module, rows, search, onEdit, onDelete }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const an = Array.isArray(av) ? av.length : av;
      const bn = Array.isArray(bv) ? bv.length : bv;
      if (an < bn) return sortDir === "asc" ? -1 : 1;
      if (an > bn) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  if (rows.length === 0) {
    return (
      <div className="panel empty-panel">
        <div className="empty-state">
          <div className="empty-seal">§</div>
          <div className="empty-title">No records on file</div>
          <div className="empty-sub">This register is currently empty.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel table-panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} onClick={() => handleSort(col)}>
                  {col}{sortCol === col && (sortDir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id ?? i} className="data-row">
                {columns.map((col) => {
                  const val = row[col];
                  if (col === "role") {
                    return <td key={col}><span className="badge" style={{ background: roleColors[val] }}>{val}</span></td>;
                  }
                  if (Array.isArray(val)) return <td key={col} className="muted">{val.length || "—"}</td>;
                  if (val === null || val === undefined || val === "") return <td key={col} className="muted">—</td>;
                  return <td key={col}>{String(val)}</td>;
                })}
                <td className="actions-col">
                  <button className="row-btn" onClick={() => onEdit(row)}>Edit</button>
                  <button className="row-btn row-btn-danger" onClick={() => onDelete(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length !== rows.length && (
        <div className="filter-note">Showing {sorted.length} of {rows.length} records</div>
      )}
    </div>
  );
}

export default function App() {
  const [activeKey, setActiveKey] = useState("users");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const active = MODULES.find((m) => m.key === activeKey);

  const load = () => {
    setLoading(true);
    setError(null);
    active.list()
      .then((data) => { setRows(data); setOnline(true); setLastUpdated(new Date()); })
      .catch((err) => { setError(err.message); setOnline(false); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { setSearch(""); load(); /* eslint-disable-next-line */ }, [activeKey]);

  useEffect(() => {
    const id = setInterval(() => {
      getUsers().then(() => setOnline(true)).catch(() => setOnline(false));
    }, 20000);
    return () => clearInterval(id);
  }, []);

  const handleDeleteConfirmed = async () => {
    try {
      await active.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (ex) {
      alert(`Delete failed: ${ex.message}`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="seal">V</div>
            <div>
              <div className="brand-title">The Vault Registry</div>
              <div className="brand-sub">Student Project &amp; Equipment Records</div>
            </div>
          </div>
          <div className="conn-status">
            <StatusDot online={online} />
            <span>{online ? "System online" : "Connection lost"}</span>
          </div>
        </div>

        <nav className={`site-nav ${navOpen ? "open" : ""}`}>
          {MODULES.map((m) => (
            <button key={m.key} className={`nav-item ${activeKey === m.key ? "active" : ""}`}
            onClick={() => { setActiveKey(m.key); setNavOpen(false); }}>
            <span>{m.label}</span>
          </button>
          ))}
        </nav>

        <button className="nav-toggle" onClick={() => setNavOpen((o) => !o)}>
          {navOpen ? "Close menu" : "Browse modules ▾"}
        </button>
      </header>

      <main className="main">
        <div className="page-title">
        <h1>{active.label}</h1>
      </div>

        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder={`Search ${active.label.toLowerCase()}...`}
              value={search} onChange={(e) => setSearch(e.target.value)}
              disabled={loading || rows.length === 0} />
          </div>
          <div className="controls-right">
            {lastUpdated && !loading && <span className="muted small">Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button className="refresh-btn" onClick={load} disabled={loading}>
              <span className={loading ? "spin" : ""}>⟳</span> Refresh
            </button>
            <button className="btn-primary" onClick={() => setModalMode("create")}>+ New</button>
            {!loading && !error && <div className="count-badge">{rows.length} total</div>}
          </div>
        </div>

        <div className="content fade-in" key={activeKey}>
          {error && (
            <div className="panel error-panel">
              <div className="empty-state">
                <div className="empty-seal error-seal">!</div>
                <div className="empty-title">Request failed</div>
                <div className="empty-sub">{error}</div>
              </div>
            </div>
          )}

          {loading && !error && (
            <div className="panel table-panel">
              <table><tbody><SkeletonRows cols={5} rows={6} /></tbody></table>
            </div>
          )}

          {!loading && !error && (
            <DataTable
              module={active}
              rows={rows}
              search={search}
              onEdit={(row) => { setEditTarget(row); setModalMode("edit"); }}
              onDelete={(row) => setDeleteTarget(row)}
            />
          )}
        </div>
      </main>

      <footer className="site-footer">
      <span>The Vault Registry</span>
      </footer>

      {modalMode && (
        <FormModal
          module={active}
          initial={modalMode === "edit" ? editTarget : null}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSaved={load}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete
          label={active.label}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}