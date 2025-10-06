// BioManager React Port (single-file)
// ------------------------------------------------------------
// How to use:
// 1) Drop this component into a React project (Vite, CRA, Next.js client page).
// 2) Import your existing CSS so styles match:
//    import "./css/BioManager_style.css";
//    import "./css/Bios.css";
//    import "./css/Manage-users_style.css";
// 3) Render <BioManagerApp />.
//
// Notes:
// - Mirrors your iframe-based shell as a single React app using hash routing.
// - Preserves classNames from your HTML/CSS so visuals remain intact.
// - Re-implements Bio and User models from your JS with localStorage for users.
// - Minimal inline SVGs are used for icons where helpful; feel free to swap with your assets.

import React, { useEffect, useMemo, useState } from "react";
import "./css/BioManager_style.css";
import "./css/Bios.css";
import "./css/Manage-users_style.css";

import fileText from "./assets/file-text.svg";
import dashboard from "./assets/dashboard.svg";
import usersIco from "./assets/users.svg";
import building from "./assets/building.svg";
import logoutIco from "./assets/logout.svg";
import searchIco from "./assets/search.svg";
import clockIco from "./assets/clock.svg";
import alertIco from "./assets/circle-alert.svg";
import checkIco from "./assets/circle-check.svg";
import eyeIco from "./assets/eye.svg";
import userCheckIco from "./assets/user-check.svg";
import shieldIco from "./assets/shield.svg";
import userXIco from "./assets/user-x.svg";

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
function classNames(...xs) { return xs.filter(Boolean).join(" "); }
function pad2(n){ return String(n).padStart(2, "0"); }
function formatDate(d){
  const dt = d instanceof Date ? d : new Date(d);
  return `${pad2(dt.getMonth()+1)}/${pad2(dt.getDate())}/${dt.getFullYear()}`;
}

// ------------------------------------------------------------
// Models (ported from your JS)
// ------------------------------------------------------------
class Bio {
  /**
   * @param {{id:string,name:string,email:string,status:"Submitted"|"Ready for Review"|"Approved"|"Live",created:Date|string, reviewInfo?:string}} o
   */
  constructor(o){
    this.id = o.id;
    this.name = o.name;
    this.email = o.email;
    this.status = o.status;
    this.created = o.created instanceof Date ? o.created : new Date(o.created);
    this.reviewInfo = (o.status === "Submitted" || o.status === "Ready for Review") ? "Not reviewed" : "Reviewed";
  }
  get createdLabel(){ return formatDate(this.created); }
  static all(){ return Bio.DATA.map(d => new Bio(d)); }
}
Bio.DATA = [
  { id: "1", name: "Achal Aggarwal",  email: "achal@bornwest.com",   status: "Live",              created: "2025-07-14" },
  { id: "2", name: "Prateek Sharma",  email: "prateek@bornwest.com", status: "Approved",          created: "2025-07-07" },
  { id: "3", name: "Himalaya Rajput", email: "himalaya@bornwest.com",status: "Ready for Review",  created: "2025-08-01" },
  { id: "4", name: "Sumit Raj",       email: "sumit@bornwest.com",   status: "Submitted",         created: "2025-08-14" },
];

class UserRec {
  /**
   * @param {{id:string,userName:string,email:string,role:"admin"|"user",status:"active"|"inactive"|"compliance",createdAt:Date|string}} o
   */
  constructor(o){
    this.id = o.id;
    this.userName = o.userName;
    this.email = o.email;
    this.role = o.role;
    this.status = o.status;
    this.createdAt = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
  }
  get createdLabel(){ return formatDate(this.createdAt); }
}

const USER_STORE_KEY = "bm_users";
function seedUsers(){
  const seed = [
    { id: "u1", userName: "Achal Aggarwal",  email: "achal@bornwest.com",   role: "admin", status: "active",     createdAt: "2025-07-14" },
    { id: "u2", userName: "Prateek Sharma",  email: "prateek@bornwest.com", role: "user",  status: "active",     createdAt: "2025-07-07" },
    { id: "u3", userName: "Himalaya Rajput", email: "himalaya@bornwest.com",role: "user",  status: "compliance", createdAt: "2025-08-01" },
    { id: "u4", userName: "Sumit Raj",       email: "sumit@bornwest.com",   role: "user",  status: "inactive",   createdAt: "2025-08-14" },
  ];
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(seed));
  return seed;
}
function loadUsersRaw(){
  const json = localStorage.getItem(USER_STORE_KEY);
  if (json){ try { return JSON.parse(json); } catch{} }
  return seedUsers();
}
function saveUsersRaw(arr){ localStorage.setItem(USER_STORE_KEY, JSON.stringify(arr)); }

// CRUD helpers (hook-friendly)
function getAllUsers(){ return loadUsersRaw().map(o => new UserRec(o)); }
function findUserById(id){ const x = loadUsersRaw().find(r => r.id === id); return x ? new UserRec(x) : null; }
function emailInUse(email, excludeId=null){
  const needle = (email||"").trim().toLowerCase();
  return loadUsersRaw().some(r => r.id !== excludeId && (r.email||"").toLowerCase() === needle);
}
function createUser({userName,email,role,status,createdAt}){
  const id = (crypto?.randomUUID?.() || `u_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
  const rec = { id, userName, email, role, status, createdAt: (createdAt instanceof Date ? createdAt : new Date(createdAt)).toISOString() };
  const raw = loadUsersRaw(); raw.push(rec); saveUsersRaw(raw); return new UserRec(rec);
}
function updateUser(id, patch){
  const raw = loadUsersRaw(); const idx = raw.findIndex(r => r.id === id); if (idx === -1) return null;
  const merged = { ...raw[idx], ...patch }; raw[idx] = merged; saveUsersRaw(raw); return new UserRec(merged);
}

// ------------------------------------------------------------
// Icons (inline SVG)
// ------------------------------------------------------------
const Icon = {
  FileText:   () => <img src={fileText}   width={20} height={20} alt="" />,
  Dashboard:  () => <img src={dashboard}  width={20} height={20} alt="" />,
  Users:      () => <img src={usersIco}   width={20} height={20} alt="" />,
  Building:   () => <img src={building}   width={20} height={20} alt="" />,
  Logout:     () => <img src={logoutIco}  width={20} height={20} alt="" />,
  Search:     () => <img src={searchIco}  width={18} height={18} alt="" />,
  Clock:      () => <img src={clockIco}   width={16} height={16} alt="" />,
  Alert:      () => <img src={alertIco}   width={16} height={16} alt="" />,
  Check:      () => <img src={checkIco}   width={16} height={16} alt="" />,
  Eye:        () => <img src={eyeIco}     width={14} height={14} alt="View" />,
  UserCheck:  () => <img src={userCheckIco} width={16} height={16} alt="" />,
  Shield:     () => <img src={shieldIco}    width={16} height={16} alt="" />,
  UserX:      () => <img src={userXIco}     width={16} height={16} alt="" />,
};

// ------------------------------------------------------------
// Hash router (simple)
// ------------------------------------------------------------
function useHashRoute(defaultRoute = "#all-bios"){
  const [hash, setHash] = useState(() => window.location.hash || defaultRoute);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || defaultRoute);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [defaultRoute]);
  const navigate = (h) => { if (window.location.hash !== h) window.location.hash = h; else setHash(h); };
  return [hash, navigate];
}

// ------------------------------------------------------------
// Shell
// ------------------------------------------------------------
export default function BioManagerApp(){
  const [hash, navigate] = useHashRoute("#all-bios");

  useEffect(() => { document.title = "BioManager"; }, []);

  return (
    <div className="app-root" style={{display:"flex",height:"100vh",overflow:"hidden"}}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon.FileText /></div>
          <div className="brand-texts">
            <div className="brand-title">BioManager</div>
            <div className="brand-subtitle">Marketing Bio Portal</div>
          </div>
        </div>
        <div className="sidebar-sep" />
        <h3 className="nav-label">NAVIGATION</h3>
        <nav className="nav" id="left-nav">
          <a href="#dashboard" className={classNames("nav-link", hash==="#dashboard" && "active")} onClick={(e)=>{e.preventDefault(); navigate("#dashboard");}}>
            <span className="nav-ico"><Icon.Dashboard /></span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="#manage-users" className={classNames("nav-link", hash==="#manage-users" && "active")} onClick={(e)=>{e.preventDefault(); navigate("#manage-users");}}>
            <span className="nav-ico"><Icon.Users /></span>
            <span className="nav-text">Manage Users</span>
          </a>
          <a href="#approved-domains" className={classNames("nav-link", hash==="#approved-domains" && "active")} onClick={(e)=>{e.preventDefault(); navigate("#approved-domains");}}>
            <span className="nav-ico"><Icon.Building /></span>
            <span className="nav-text">Approved Domains</span>
          </a>
          <a href="#all-bios" className={classNames("nav-link", (hash===""||hash==="#all-bios") && "active")} onClick={(e)=>{e.preventDefault(); navigate("#all-bios");}}>
            <span className="nav-ico"><Icon.FileText /></span>
            <span className="nav-text">All Bios</span>
          </a>
        </nav>

        <div className="user-info">
          <div className="user-left">
            <div className="user-avatar">S</div>
            <div className="user-meta">
              <div className="user-name">satish</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
          <button className="user-logout" onClick={()=>alert("logout button tapped!")}><Icon.Logout /></button>
        </div>
      </aside>

      <main className="main-content" style={{flex:1,minWidth:0,overflow:"hidden",display:"grid"}}>
        {hash === "#all-bios" && <BiosPage />}
        {hash === "#manage-users" && <ManageUsersPage />}
        {hash === "#dashboard" && <ComingSoonPage />}
        {hash === "#approved-domains" && <ComingSoonPage />}
      </main>
    </div>
  );
}



// ------------------------------------------------------------
// Coming Soon
// ------------------------------------------------------------
function ComingSoonPage(){
  useEffect(()=>{ document.getElementById("page-title")?.remove(); }, []); // noop, style kept consistent
  return (
    <div className="wrap" style={{display:"grid",placeItems:"center",padding:24}}>
      <div className="card" style={{maxWidth:420}}>
        <h1>Coming soon</h1>
        <p>This section is under construction.</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Bios Page
// ------------------------------------------------------------
function BiosPage(){
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All Status");
  const bios = useMemo(() => Bio.all(), []);

  const filtered = useMemo(() => bios.filter(b => {
    const t = q.trim().toLowerCase();
    const matchesText = !t || b.name.toLowerCase().includes(t) || b.email.toLowerCase().includes(t);
    const matchesStatus = status === "All Status" || b.status === status;
    return matchesText && matchesStatus;
  }), [bios, q, status]);

  const stats = useMemo(() => computeBioStats(bios), [bios]);

  useEffect(()=>{
    document.title = "All Bios";
  }, []);

  return (
    <div style={{display:"flex",flexDirection:"column"}}>
      <header className="page-header">
        <div className="page-headings">
          <h1 id="page-title">All Bios</h1>
          <p id="page-subtitle">Overview of all employee bio submissions</p>
        </div>
        <button className="btn-export" onClick={()=>alert("Export CSV button tapped!")}>Export CSV</button>
      </header>

      <section id="page-content">
        <StatsTiles stats={stats} layout="bios" />

        <div className="card" id="search">
          <div className="search-row">
            <div className="search-input-wrap">
              <span className="search-ico"><Icon.Search /></span>
              <input id="bio-search" className="js-bio-search" type="text" placeholder="Search bios..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <div className="select-wrap">
              <select id="bio-status" className="js-bio-status" value={status} onChange={e=>setStatus(e.target.value)}>
                <option>All Status</option>
                <option>Submitted</option>
                <option>Ready for Review</option>
                <option>Approved</option>
                <option>Live</option>
              </select>
              {/* caret handled by CSS background or the img replacement not needed here */}
            </div>
          </div>
        </div>

        <div className="card bios-card">
          <div className="table-header">
            <h2 className="table-title">Bios (<span>{filtered.length}</span>)</h2>
          </div>

          {filtered.length > 0 ? (
            <>
              <div className="bios-head bios-grid">
                <span>Employee</span>
                <span>Status</span>
                <span>Created</span>
                <span>Review Info</span>
                <span>Actions</span>
              </div>
              <div className="bios-list js-bios-list">
                {filtered.map(b => <BioRow key={b.id} bio={b} />)}
              </div>
            </>
          ) : (
            <div className="bios-list js-bios-list is-empty">
              <div className="bios-row bios-grid empty-state"><span>No results</span></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function computeBioStats(list){
  const total = list.length;
  const submitted = list.filter(b => b.status === "Submitted").length;
  const inReview = list.filter(b => b.status === "Ready for Review").length;
  const approved = list.filter(b => b.status === "Approved").length;
  const live = list.filter(b => b.status === "Live").length;
  return { total, submitted, inReview, approved, live };
}

function StatsTiles({ stats, layout }) {
  const tileMeta = layout === "bios" ? {
    total:     { label: "Total Bios",       icon: <Icon.FileText /> },
    submitted: { label: "Submitted",        icon: <Icon.Clock /> },
    inReview:  { label: "In Review",        icon: <Icon.Alert /> },
    approved:  { label: "Approved",         icon: <Icon.Check /> },
    live:      { label: "Live",             icon: <Icon.Building /> },
  } : {
    totalUsers:    { label: "Total Users",     icon: <Icon.Users /> },
    activeUsers:   { label: "Active Users",    icon: <Icon.Check /> },
    compliance:    { label: "Compliance Team", icon: <Icon.Alert /> },
    inactiveUsers: { label: "Inactive Users",  icon: <Icon.Logout /> },
  };

  const order = layout === "bios"
    ? ["total","submitted","inReview","approved","live"]    // 5
    : ["totalUsers","activeUsers","compliance","inactiveUsers"]; // 4

  // classes used by your CSS files
  const biosTabClass = {
    total: "tab-all",
    submitted: "tab-submitted",
    inReview: "tab-inReview",
    approved: "tab-approved",
    live: "tab-live",
  };
  const userTileClass = {
    totalUsers: "user-stat user-stat--gray",
    activeUsers: "user-stat user-stat--green",
    compliance: "user-stat user-stat--blue",
    inactiveUsers: "user-stat user-stat--red",
  };

  return (
    <div className="stats-wrapper" id="stats-root">
      <div
        className="stats"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${order.length}, minmax(0, 1fr))`,
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        {order.map((key) => (
          <div
            key={key}
            data-key={key}
            className={classNames(
              "stat",
              layout === "users" ? userTileClass[key] : "stat--tab " + biosTabClass[key]
            )}
            style={{ minWidth: 0 }}
          >
            <div className="stat-head">
              <span className="stat-icon">{tileMeta[key]?.icon}</span>
              <span className="stat-label-text">{tileMeta[key]?.label}</span>
            </div>
            <div className="stat-value">{String(stats[key] ?? 0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


function BioRow({bio}){
  const chipClass = {
    "Submitted": "submitted",
    "Ready for Review": "review",
    "Approved": "approved",
    "Live": "live",
  }[bio.status] || "";

  const BIO_STATUS_ICON_CMP = {
    "Submitted":        Icon.Clock,
    "Ready for Review": Icon.Alert,
    "Approved":         Icon.Check,
    "Live":             Icon.Building,
  };
  const BioStatusIcon = BIO_STATUS_ICON_CMP[bio.status] ?? Icon.FileText;
  return (
    <div className="bios-row bios-grid js-bio-row" data-id={bio.id}>
      <div className="bios-col">
        <span className="js-name">{bio.name}</span><br />
        <small className="js-email">{bio.email}</small>
      </div>
      <div className="bios-col">
        <span className={classNames("status", chipClass)}>
          <span className="status-icon" aria-hidden><BioStatusIcon /></span>
          <span className="js-status-text">{bio.status}</span>
        </span>
      </div>
      <div className="bios-col js-created">{bio.createdLabel}</div>
      <div className="bios-col js-review-info">{bio.reviewInfo}</div>
      <div className="bios-col">
        <button className="view-btn"><span className="view-icon"><Icon.Eye /></span> View</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Manage Users Page
// ------------------------------------------------------------
function ManageUsersPage(){
  const [users, setUsers] = useState(() => getAllUsers());
  const [modalState, setModalState] = useState({ open:false, mode:"add", record:null });

  useEffect(()=>{ document.title = "Manage Users"; }, []);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    compliance: users.filter(u => u.status === "compliance").length,
    inactiveUsers: users.filter(u => u.status === "inactive").length,
  }), [users]);

  function refresh(){ setUsers(getAllUsers()); }

  function openAdd(){ setModalState({ open:true, mode:"add", record:null }); }
  function openEdit(rec){ setModalState({ open:true, mode:"edit", record:rec }); }
  function closeModal(){ setModalState({ open:false, mode:"add", record:null }); }

  function toggleUser(u){
    const next = (u.status === "inactive") ? "active" : "inactive";
    updateUser(u.id, { status: next });
    refresh();
  }

  return (
    <div style={{display:"flex",flexDirection:"column"}}>
      <header className="page-header">
        <div className="page-headings">
          <h1 id="page-title">Manage Users</h1>
          <p id="page-subtitle">Manage user accounts and permissions</p>
        </div>
        <button className="btn-export" onClick={openAdd}>+ Add User</button>
      </header>

      <section id="page-content">
        <StatsTiles stats={stats} layout="users" />

        <div className="card users-card">
          <div className="table-header">
            <h2 className="table-title">Users (<span>{users.length}</span>)</h2>
          </div>

          {users.length > 0 ? (
            <>
              <div className="users-head users-grid">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Created</span>
                <span>Actions</span>
              </div>
              <div className="users-list js-users-list">
                {users.map(u => (
                  <UserRow key={u.id} user={u} onToggle={()=>toggleUser(u)} onEdit={()=>openEdit(u)} />
                ))}
              </div>
            </>
          ) : (
            <div className="users-list js-users-list is-empty">
              <div className="users-row users-grid empty-state">No results</div>
            </div>
          )}
        </div>
      </section>

      {modalState.open && (
        <UserModal
          mode={modalState.mode}
          record={modalState.record}
          onClose={closeModal}
          onSaved={()=>{ closeModal(); refresh(); }}
        />
      )}
    </div>
  );
}

function UserRow({user, onToggle, onEdit}){
  const statusChipClass = { active: "active", compliance: "compliance", inactive: "inactive" }[user.status] || "";
  const shouldActivate = user.status === "inactive" || user.status === "compliance";
  const USER_STATUS_ICON_CMP = {
    "active":      Icon.UserCheck,
    "compliance":  Icon.Shield,
    "inactive":    Icon.UserX,
  };
  const UserStatusIcon = USER_STATUS_ICON_CMP[user.status] ?? Icon.UserX;
  return (
    <div className="users-row users-grid js-user-row" data-id={user.id}>
      <div className="users-col">
        <span className="js-name">{user.userName}</span><br />
        <small className="js-email">{user.email}</small>
      </div>
      <div className="users-col js-role">{capitalize(user.role)}</div>
      <div className="users-col">
        <span className={classNames("status", statusChipClass)}>
          <span className="status-icon" aria-hidden><UserStatusIcon /></span>
          <span className="js-status-text">{capitalize(user.status)}</span>
        </span>
      </div>
      <div className="users-col js-created">{user.createdLabel}</div>
      <div className="users-col">
        <div className="actions">
          <button className="btn btn-edit" onClick={onEdit}><span className="btn-ico" aria-hidden /> Edit</button>
          <button className={classNames("btn","btn-toggle", shouldActivate ? "btn-activate" : "btn-deactivate")} onClick={onToggle}>
            <span className="btn-label">{shouldActivate ? "Activate" : "Deactivate"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({mode, record, onClose, onSaved}){
  const isEdit = mode === "edit" && record;
  const [form, setForm] = useState(() => ({
    userName: isEdit ? record.userName : "",
    email: isEdit ? record.email : "",
    role: isEdit ? record.role : "",
  }));
  const [errors, setErrors] = useState({});

  function validate(){
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.userName.trim()) errs.userName = "Name is required.";
    if (!emailRe.test(form.email)) errs.email = "Enter a valid email.";
    else if (emailInUse(form.email, isEdit ? record.id : null)) errs.email = "Email already exists.";
    if (!["admin","user"].includes(form.role)) errs.role = "Select a role.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submit(e){
    e.preventDefault();
    if (!validate()) return;
    if (isEdit) {
      updateUser(record.id, { userName: form.userName.trim(), email: form.email.trim(), role: form.role });
    } else {
      createUser({ userName: form.userName.trim(), email: form.email.trim(), role: form.role, status: "inactive", createdAt: new Date() });
    }
    onSaved?.();
  }

  useEffect(() => {
    function onEsc(ev){ if (ev.key === "Escape") onClose?.(); }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="user-modal-title">{isEdit ? "Edit User" : "Add User"}</h2>
          <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>&times;</button>
        </div>
        <form id="user-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="f-userName">Full name</label>
              <input id="f-userName" name="userName" type="text" value={form.userName} onChange={e=>setForm({...form, userName:e.target.value})} className={errors.userName?"is-invalid":""} />
              <small className="field-error">{errors.userName || ""}</small>
            </div>
            <div className="form-field">
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className={errors.email?"is-invalid":""} />
              <small className="field-error">{errors.email || ""}</small>
            </div>
            <div className="form-field">
              <label htmlFor="f-role">Role</label>
              <select id="f-role" name="role" value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className={errors.role?"is-invalid":""}>
                <option value="">Select…</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <small className="field-error">{errors.role || ""}</small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? "Save Changes" : "Save User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
