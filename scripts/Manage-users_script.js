import { User } from "./User.js";

// DOM
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const pageContent = document.getElementById("page-content");
const addBtn = document.getElementById("export-csv");

// Templates
const $ = (id) => document.getElementById(id);
const tplStatsWrapper = $("stats-wrapper-template");
const tplStatsTile = $("stats-tile-template");
const tplUsersList = $("users-list-template");
const tplUserItem  = $("user-item-template");
const tplUserModal = $("user-modal-template");
const clone = (tpl) => tpl.content.firstElementChild.cloneNode(true);

// Icons for stats
const tileMeta = {
  totalUsers:    { label: "Total Users",     icon: "../icons/users.svg",      klass: "user-stat--gray"  },
  activeUsers:   { label: "Active Users",    icon: "../icons/user-check.svg", klass: "user-stat--green" },
  compliance:    { label: "Compliance Team", icon: "../icons/shield.svg",     klass: "user-stat--blue"  },
  inactiveUsers: { label: "Inactive Users",  icon: "../icons/user-x.svg",     klass: "user-stat--red"   },
};

// Status chip icons
const statusImages = {
  active: "../icons/user-check.svg",
  compliance: "../icons/shield.svg",
  inactive: "../icons/user-x.svg",
};
const statusChipClass = { active: "active", compliance: "compliance", inactive: "inactive" };

// --- Stats helpers ---
function computeUserStats(users) {
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    compliance: users.filter(u => u.status === "compliance").length,
    inactiveUsers: users.filter(u => u.status === "inactive").length,
  };
}
function buildStatsTiles(statsObj) {
  const wrapper = clone(tplStatsWrapper);
  const grid = wrapper.querySelector(".stats");
  ["totalUsers", "activeUsers", "compliance", "inactiveUsers"].forEach(key => {
    const tile = clone(tplStatsTile);
    const meta = tileMeta[key];
    tile.classList.add(meta.klass);
    tile.querySelector(".stat-icon").src = meta.icon;
    tile.querySelector(".stat-icon").alt = meta.label;
    tile.querySelector(".stat-label-text").textContent = meta.label;
    tile.querySelector(".stat-value").textContent = String(statsObj[key] ?? 0);
    grid.appendChild(tile);
  });
  return wrapper;
}

// --- List helpers ---
function buildUserItem(user) {
  const row = clone(tplUserItem);
  row.dataset.id = user.id;
  row.querySelector(".js-name").textContent  = user.userName;
  row.querySelector(".js-email").textContent = user.email;
  row.querySelector(".js-role").textContent  = capitalize(user.role);

  const statusWrap = row.querySelector(".status");
  statusWrap.classList.add(statusChipClass[user.status] || "");
  const ico = row.querySelector(".status-icon");
  ico.src = statusImages[user.status] || "../icons/settings.svg";
  ico.alt = user.status;
  row.querySelector(".js-status-text").textContent = capitalize(user.status);
  row.querySelector(".js-created").textContent     = user.createdLabel;

  // Toggle button text + style
  const toggleBtn = row.querySelector(".btn-toggle");
  const label = toggleBtn.querySelector(".btn-label");
  const shouldActivate = user.status === "inactive" || user.status === "compliance";
  label.textContent = shouldActivate ? "Activate" : "Deactivate";
  toggleBtn.classList.add(shouldActivate ? "btn-activate" : "btn-deactivate");

  return row;
}
function buildUsersList(list) {
  const card   = clone(tplUsersList);
  const head   = card.querySelector(".users-head");
  const listEl = card.querySelector(".js-users-list");
  const count  = card.querySelector("#users-count");
  count.textContent = String(list.length);

  if (list.length === 0) {
    if (head) head.style.display = "none";
    listEl.classList.add("is-empty");
    const empty = document.createElement("div");
    empty.className = "users-row users-grid empty-state";
    empty.textContent = "No results";
    listEl.appendChild(empty);
  } else {
    if (head) head.style.display = "";
    listEl.classList.remove("is-empty");
    const frag = document.createDocumentFragment();
    for (const u of list) frag.appendChild(buildUserItem(u));
    listEl.appendChild(frag);
  }
  return card;
}

// --- Modal helpers ---
function openUserModal({ mode = "add", user = null } = {}) {
  const modal = clone(tplUserModal);
  document.body.appendChild(modal);

  const form = modal.querySelector("#user-form");
  const closeBtn = modal.querySelector(".modal-close");
  const cancelBtn = modal.querySelector(".js-cancel");
  const titleEl = modal.querySelector("#user-modal-title");
  const saveBtn = modal.querySelector(".btn-primary");

  // Configure for add vs edit
  const isEdit = mode === "edit" && user;
  titleEl.textContent = isEdit ? "Edit User" : "Add User";
  saveBtn.textContent = isEdit ? "Save Changes" : "Save User";

  // Prefill for edit
  if (isEdit) {
    form.elements.userName.value = user.userName;
    form.elements.email.value = user.email;
    form.elements.role.value = user.role;
  }

  function destroy() {
    document.removeEventListener("keydown", escHandler);
    modal.remove();
  }
  function escHandler(e) { if (e.key === "Escape") destroy(); }

  closeBtn.addEventListener("click", destroy);
  cancelBtn.addEventListener("click", destroy);
  modal.addEventListener("click", (e) => { if (e.target === modal) destroy(); });
  document.addEventListener("keydown", escHandler);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(form);

    const data = formToObject(new FormData(form));
    const { valid, errors } = validateUser(data, { excludeId: isEdit ? user.id : null });
    if (!valid) { paintErrors(form, errors); return; }

    if (isEdit) {
      User.update(user.id, {
        userName: data.userName.trim(),
        email: data.email.trim(),
        role: data.role
      });
    } else {
      User.create({
        userName: data.userName.trim(),
        email: data.email.trim(),
        role: data.role,
        status: "inactive",     // default for new users
        createdAt: new Date()
      });
    }

    destroy();
    renderManageUsers();
  });
}

function formToObject(fd) {
  const o = {};
  for (const [k,v] of fd.entries()) o[k] = v;
  return o;
}

function validateUser(o, { excludeId = null } = {}) {
  const errors = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!o.userName || !o.userName.trim()) errors.userName = "Name is required.";
  if (!o.email || !emailRe.test(o.email)) errors.email = "Enter a valid email.";
  else if (User.emailInUse(o.email, excludeId)) errors.email = "Email already exists.";

  if (!["admin","user"].includes(o.role)) errors.role = "Select a role.";

  return { valid: Object.keys(errors).length === 0, errors };
}



function paintErrors(form, errors) {
  for (const [field, msg] of Object.entries(errors)) {
    const input = form.querySelector(`[name="${field}"]`);
    const err = form.querySelector(`[data-err-${field}]`);
    if (input) input.classList.add("is-invalid");
    if (err) err.textContent = msg;
  }
}
function clearErrors(form) {
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  form.querySelectorAll(".field-error").forEach(el => el.textContent = "");
}

// --- Page render ---
function renderManageUsers() {
  const users = User.all();
  const statsEl = buildStatsTiles(computeUserStats(users));
  const listEl  = buildUsersList(users);
  pageContent.replaceChildren(statsEl, listEl);
}

// Toggle handler (delegated)
pageContent.addEventListener("click", (e) => {
  // Toggle status
  const toggleBtn = e.target.closest(".btn-toggle");
  if (toggleBtn) {
    const row = toggleBtn.closest(".js-user-row");
    const rec = row ? User.findById(row.dataset.id) : null;
    if (rec) {
      const next = (rec.status === "inactive") ? "active" : "inactive";
      User.update(rec.id, { status: next });
      renderManageUsers();
    }
    return;
  }

  // Edit user
  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) {
    const row = editBtn.closest(".js-user-row");
    const rec = row ? User.findById(row.dataset.id) : null;
    if (rec) openUserModal({ mode: "edit", user: rec });
  }
});


// Boot
window.addEventListener("load", () => {
  pageTitle.textContent = "Manage Users";
  pageSubtitle.textContent = "Manage user accounts and permissions";
  renderManageUsers();
});

// Add user -> open modal
if (addBtn) addBtn.onclick = () => openUserModal({ mode: "add" });

function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
